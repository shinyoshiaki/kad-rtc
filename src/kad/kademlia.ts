require("babel-polyfill");
import WebRTC from "webrtc4me";
import Helper from "./kUtil";
import KResponder from "./kResponder";
import def, { networkFormat } from "./KConst";
import { distance } from "kad-distance";
import { message } from "webrtc4me/lib/interface";
import { BSON } from "bson";

const bson = new BSON();

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
    isConnect: false,
    isOffer: false,
    findNode: "",
    hash: {}
  };

  callback = {
    onConnect: () => {},
    onAddPeer: (v?: any) => {},
    onPeerDisconnect: (v?: any) => {},
    onFindValue: (v?: any) => {},
    onFindNode: (v?: any) => {},
    onStore: (v?: any) => {},
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

  store(sender: string, key: string, value: any) {
    //自分に一番近いピアを取得
    const peer = this.f.getCloseEstPeer(key);
    if (!peer) return;
    console.log(def.STORE, "next", peer.nodeId, "target", key);
    const sendData: StoreFormat = { sender, key, value };
    const network = networkFormat(this.nodeId, def.STORE, sendData);
    peer.send(network, "kad");
    console.log("store done", { network });
    this.keyValueList[key] = value;
    this.callback.onStore(this.keyValueList);
  }

  storeChunks(sender: string, key: string, chunks: ArrayBuffer[]) {
    const peer = this.f.getCloseEstPeer(key);
    if (!peer) return;
    chunks.forEach((chunk, i) => {
      const sendData: StoreChunks = {
        sender: this.nodeId,
        key,
        value: chunk,
        index: i,
        size: chunks.length
      };
      const network = networkFormat(sender, def.STORE_CHUNKS, sendData);
      peer.send(network, "kad");
      this.keyValueList[key] = chunks;
      this.callback.onStore(this.keyValueList);
    });
  }

  findNode(targetId: string, peer: WebRTC) {
    console.log("findnode", targetId);
    this.state.findNode = targetId;
    const sendData = { targetKey: targetId };
    //送る
    peer.send(networkFormat(this.nodeId, def.FINDNODE, sendData), "kad");
  }

  findValue(key: string, cb = (value: any) => {}) {
    this.callback.onFindValue = cb;
    //keyに近いピアを取得
    const peers = this.f.getClosePeers(key);
    peers.forEach(peer => {
      this.doFindvalue(key, peer);
    });
  }

  async doFindvalue(key: string, peer: WebRTC) {
    console.log("dofindvalue", peer.nodeId);
    const sendData: FindValue = { targetKey: key };
    peer.send(networkFormat(this.nodeId, def.FINDVALUE, sendData), "kad");
  }

  connect(peer: WebRTC) {
    if (!this.state.isConnect) {
      this.state.isConnect = true;
      this.addknode(peer);
      this.callback.onConnect();
    }
  }

  addknode(peer: WebRTC) {
    peer.events.data["kademlia.ts"] = raw => {
      this.onCommand(raw);
    };

    peer.disconnect = () => {
      console.log("kad node disconnected");
      this.f.cleanDiscon();
      this.callback.onAddPeer(this.f.getAllPeerIds());
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

  private findNewPeer(peer: WebRTC) {
    if (this.f.getKbucketNum() < this.k) {
      //自身のノードIDをkeyとしてFIND_NODE
      this.findNode(this.nodeId, peer);
    } else {
      console.log("kbucket ready", this.f.getKbucketNum());
    }
  }

  private async maintain(network: any) {
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
      kbucket.shift();
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
        const sendData: StoreFormat = {
          sender: this.nodeId,
          key: target,
          value: { sdp }
        };
        if (_) _.send(networkFormat(this.nodeId, def.STORE, sendData), "kad");
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

  private onCommand(message: message) {
    switch (message.label) {
      case "kad":
        const dataLink: Buffer = Buffer.from(message.data);
        console.log({ dataLink });
        try {
          console.log("oncommand kad", { message }, { dataLink });
          const networkLayer: network = bson.deserialize(dataLink);
          if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
            this.dataList.push(networkLayer.hash);
            this.onRequest(networkLayer);
          }
        } catch (error) {
          console.log(error);
        }
        break;
    }
  }

  private onRequest(network: any) {
    this.responder.response(network.type, network);
    this.maintain(network);
  }
}
