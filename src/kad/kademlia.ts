require("babel-polyfill");
import WebRTC from "webrtc4me";
import Helper from "./kUtil";
import KResponder from "./kResponder";
import def, { networkFormat } from "./KConst";
import { distance } from "kad-distance";
import { message } from "webrtc4me/lib/interface";

export default class Kademlia {
  nodeId: string;
  k: number;
  kbuckets: Array<Array<WebRTC>>;
  f: Helper;
  responder: KResponder;
  dataList: Array<any> = [];
  keyValueList: { [key: string]: any } = {};
  ref: { [key: string]: WebRTC } = {};
  buffer: { [key: string]: Array<any> } = {};
  state = {
    isOffer: false,
    findNode: "",
    hash: {},
    maintain: false
  };

  private onPing: { [key: string]: () => void } = {};

  callback = {
    onAddPeer: (v?: any) => {},
    onPeerDisconnect: (v?: any) => {},
    onFindValue: (v?: any) => {},
    onFindNode: (v?: any) => {},
    onStore: (v?: any) => {},
    _onPing: this.onPing,
    onApp: (v?: any) => {}
  };

  constructor(_nodeId: string, opt?: { kLength?: number }) {
    console.log("start kad", _nodeId);
    this.k = 20;
    if (opt) if (opt.kLength) this.k = opt.kLength;
    this.nodeId = _nodeId;

    this.kbuckets = new Array(160);
    for (let i = 0; i < 160; i++) {
      let kbucket: Array<any> = [];
      this.kbuckets[i] = kbucket;
    }

    this.f = new Helper(this.k, this.kbuckets);
    this.responder = new KResponder(this);
  }

  ping(peer: WebRTC) {
    return new Promise((resolve, reject) => {
      console.log("ping", peer.nodeId);

      //10秒以内にpingのフラグが立てば成功
      const timeout = setTimeout(() => {
        console.log("ping fail", peer.nodeId);
        peer.isDisconnected = true;
        this.f.cleanDiscon();
        this.callback.onPeerDisconnect(this.kbuckets);
        reject("ping timeout " + peer.nodeId);
      }, 10 * 1000);

      //ping完了時のコールバック
      this.callback._onPing[peer.nodeId] = () => {
        console.log("ping success", peer.nodeId);
        clearTimeout(timeout);
        resolve(true);
      };

      //自分のノードIDを含める
      const sendData = { target: peer.nodeId };
      //pingを送る
      peer.send(networkFormat(this.nodeId, def.PING, sendData), "kad");
    });
  }

  storeFormat(sender: string, key: string, value: any) {
    const sendData = {
      sender,
      key,
      value
    };
    return networkFormat(this.nodeId, def.STORE, sendData);
  }

  async store(sender: string, key: string, value: any) {
    //自分に一番近いピアを取得
    const peer = this.f.getCloseEstPeer(key);
    if (!peer) return;
    console.log(def.STORE, "next", peer.nodeId, "target", key);
    peer.send(this.storeFormat(sender, key, value), "kad");
    console.log("store done", this.storeFormat(sender, key, value));
  }

  async findNode(targetId: string, peer: WebRTC) {
    console.log("findnode");
    //接続確認
    const ping = this.ping(peer).catch(console.log);
    if (!ping) return;
    console.log("findnode", targetId);
    this.state.findNode = targetId;
    const sendData = { targetKey: targetId };
    //送る
    peer.send(networkFormat(this.nodeId, def.FINDNODE, sendData), "kad");
  }

  findValue(key: string, cb = (value: any) => {}) {
    this.callback.onFindValue = cb;
    //keyに近いピアを取得
    // const peers = this.f.getClosePeers(key);
    // peers.forEach(peer => {
    //   this.doFindvalue(key, peer);
    // });
    const peer = this.f.getCloseEstPeer(key);
    if (!peer) return;
    this.doFindvalue(key, peer);
  }

  async doFindvalue(key: string, peer: WebRTC) {
    console.log("dofindvalue", peer.nodeId);
    peer.send(
      networkFormat(this.nodeId, def.FINDVALUE, {
        targetKey: key
      }),
      "kad"
    );
  }

  addknode(peer: WebRTC) {
    peer.events.data["kademlia.ts"] = raw => {
      this.onCommand(raw);
    };

    peer.disconnect = () => {
      console.log("kad node disconnected");
      this.f.cleanDiscon();
    };

    if (!this.f.isNodeExist(peer.nodeId)) {
      //自分のノードIDと追加するノードIDの距離
      const num = distance(this.nodeId, peer.nodeId);
      //kbucketsの該当する距離のkbucketを呼び出す
      const kbucket = this.kbuckets[num];
      //該当するkbucketに新しいピアを加える
      kbucket.push(peer);

      console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
      console.log(this.f.getAllPeerIds());

      setTimeout(() => {
        this.findNewPeer(peer);
      }, 1000);

      this.callback.onAddPeer(this.f.getAllPeerIds());
    }
  }

  findNewPeer(peer: WebRTC) {
    if (this.f.getKbucketNum() < this.k) {
      //自身のノードIDをkeyとしてFIND_NODE
      this.findNode(this.nodeId, peer);
    } else {
      console.log("kbucket ready", this.f.getKbucketNum());
    }
  }

  onRequest(datalink: string) {
    const network = JSON.parse(datalink);
    this.responder.response(network.type, network);
    if (!this.state.maintain) this.maintain(network);
  }

  async maintain(network: any) {
    const inx = distance(this.nodeId, network.nodeId);
    const kbucket = this.kbuckets[inx];

    //送信元が該当するk-bucketの中にあった場合
    //そのノードをk-bucketの末尾に移す
    kbucket.forEach((peer, i) => {
      if (peer.nodeId === network.nodeId) {
        console.log("maintain", "Moves it to the tail of the list");
        kbucket.splice(i, 1);
        kbucket.push(peer);
        return 0;
      }
    });

    //k-bucketがすでに満杯な場合、
    //そのk-bucket中の先頭のノードがオンラインなら先頭のノードを残す
    if (kbucket.length > this.k) {
      this.state.maintain = true;
      console.log("maintain", "bucket fulled", network.nodeId);
      const result = await this.ping(kbucket[0]).catch(console.log);
      this.state.maintain = false;
      if (!result) {
        kbucket.splice(0, 1);
      }
    }
  }

  offer(target: string, proxy = null) {
    return new Promise((resolve, reject) => {
      const r = this.ref;
      const peer = (r[target] = new WebRTC());
      peer.makeOffer();

      const timeout = setTimeout(() => {
        reject("kad offer timeout");
      }, 5 * 1000);

      peer.signal = sdp => {
        console.log("kad offer store", target);
        const _ = this.f.getCloseEstPeer(target);
        if (!_) return;
        if (_.nodeId !== target)
          this.store(this.nodeId, target, { sdp, proxy });
      };

      peer.connect = () => {
        peer.nodeId = target;
        console.log("kad offer connected", target);
        this.addknode(peer);
        clearTimeout(timeout);
        resolve(true);
      };
    });
  }

  answer(target: string, sdp: string, proxy: string) {
    return new Promise((resolve, reject) => {
      const r = this.ref;
      const peer = (r[target] = new WebRTC());
      peer.makeAnswer(sdp);
      console.log("kad answer", target);

      const timeout = setTimeout(() => {
        reject("kad answer timeout");
      }, 5 * 1000);

      peer.signal = sdp => {
        const _ = this.f.getPeerFromnodeId(proxy);
        //来たルートに送り返す
        if (_) _.send(this.storeFormat(this.nodeId, target, { sdp }), "kad");
      };

      peer.connect = () => {
        peer.nodeId = target;
        console.log("kad answer connected", target);
        this.addknode(peer);
        clearTimeout(timeout);
        resolve(true);
      };
    });
  }

  send(target: string, data: any) {
    const _ = this.f.getPeerFromnodeId(target);
    if (_) _.send(networkFormat(this.nodeId, def.SEND, data), "kad");
  }

  onCommand(message: message) {
    switch (message.label) {
      case "kad":
        const dataLink = message.data;
        const networkLayer: network = JSON.parse(dataLink);
        if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
          this.dataList.push(networkLayer.hash);
          this.f.cleanDiscon();
          this.onRequest(dataLink);
        }
        break;
      case "app":
        console.log("kad onapp", message.data);
        this.callback.onApp(JSON.parse(message.data));
        break;
      case "bin":
        try {
          const json = JSON.parse(message.data);
          if (json.type === "start") {
            this.buffer[message.nodeId] = [];
          } else if (json.type === "end") {
          }
        } catch (error) {
          if (!this.buffer[message.nodeId]) {
            this.buffer[message.nodeId] = [];
          }
          this.buffer[message.nodeId].push(message.data);
        }
        break;
    }
  }
}
