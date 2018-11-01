require("babel-polyfill");
import WebRTC from "webrtc4me";
import Helper from "./kUtil";
import KResponder from "./kResponder";
import def, { networkFormat } from "./KConst";
import { distance } from "kad-distance";
import { message } from "webrtc4me/lib/interface";
import { BSON } from "bson";
import Cypher from "../lib/cypher";
import sha1 from "sha1";

const bson = new BSON();
export function excuteEvent(ev: any, v?: any) {
  console.log("excuteEvent", ev);
  Object.keys(ev).forEach(key => {
    ev[key](v);
  });
}

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
    isFirstConnect: true,
    isOffer: false,
    findNode: "",
    hash: {}
  };

  callback = {
    onConnect: () => {},
    onAddPeer: (v?: any) => {},
    onPeerDisconnect: (v?: any) => {},
    _onFindValue: (v?: any) => {},
    _onFindNode: (v?: any) => {},
    onApp: (v?: any) => {}
  };

  onStore: { [key: string]: (v: any) => void } = {};
  onFindValue: { [key: string]: (v: any) => void } = {};
  onFindNode: { [key: string]: (v: any) => void } = {};
  onP2P: { [key: string]: (v: any) => void } = {};
  events = {
    store: this.onStore,
    findvalue: this.onFindValue,
    findnode: this.onFindNode,
    p2p: this.onP2P
  };
  cypher: Cypher;

  constructor(opt?: { pubkey?: string; secKey?: string; kLength?: number }) {
    this.k = 20;
    if (opt && opt.kLength) this.k = opt.kLength;
    if (opt) this.cypher = new Cypher(opt.secKey, opt.pubkey);
    else this.cypher = new Cypher();
    this.nodeId = sha1(this.cypher.pubKey).toString();

    this.kbuckets = new Array(160);
    for (let i = 0; i < 160; i++) {
      let kbucket: Array<any> = [];
      this.kbuckets[i] = kbucket;
    }

    this.f = new Helper(this.k, this.kbuckets, this.nodeId);
    this.responder = new KResponder(this);
  }

  store(sender: string, key: string, value: any, opt?: { excludeId?: string }) {
    const peer = this.f.getCloseEstPeer(key, opt);
    if (!peer) return;
    const hash = sha1(JSON.stringify(value)).toString();
    const sendData: StoreFormat = {
      sender,
      key,
      value,
      pubKey: this.cypher.pubKey,
      hash,
      sign: this.cypher.encrypt(hash)
    };
    const network = networkFormat(this.nodeId, def.STORE, sendData);

    console.log(def.STORE, "next", peer.nodeId, "target", key);
    peer.send(network, "kad");
    //no sdp
    if (!value.sdp) this.keyValueList[key] = value;
  }

  storeChunks(
    sender: string,
    key: string,
    chunks: ArrayBuffer[],
    opt?: { excludeId?: string }
  ) {
    // const peers = this.f.getClosePeers(key, opt);
    const peer = this.f.getCloseEstPeer(key, opt);
    if (!peer) return;
    console.log("store chunks", { chunks });
    chunks.forEach((chunk, i) => {
      const hash = sha1(Buffer.from(chunk)).toString();
      const sendData: StoreChunks = {
        sender: this.nodeId,
        key,
        value: Buffer.from(chunk),
        index: i,
        pubKey: this.cypher.pubKey,
        hash,
        sign: this.cypher.encrypt(hash),
        size: chunks.length
      };
      const network = networkFormat(sender, def.STORE_CHUNKS, sendData);

      console.log(def.STORE, "next", peer.nodeId, "target", key);
      peer.send(network, "kad");
    });
    //レプリケーション
    this.keyValueList[key] = { chunks };
  }

  findNode(targetId: string, peer: WebRTC) {
    return new Promise<WebRTC>(async (resolve, reject) => {
      console.log("findnode", targetId);
      this.state.findNode = targetId;
      const sendData = { targetKey: targetId };
      //送る
      peer.send(networkFormat(this.nodeId, def.FINDNODE, sendData), "kad");

      this.callback._onFindNode((nodeId: string) => {
        excuteEvent(this.events.findnode, nodeId);
        resolve(this.f.getPeerFromnodeId(nodeId));
      });

      await new Promise(r => setTimeout(r, 10 * 1000));
      reject("timeout findnode");
    });
  }

  findValue(key: string, opt?: { ownerId?: string }) {
    return new Promise<any>(async (resolve, reject) => {
      this.callback._onFindValue = value => {
        excuteEvent(this.events.findvalue, value);
        resolve(value);
      };
      //keyに近いピアを取得
      const peers = this.f.getClosePeers(key);
      peers.forEach(peer => {
        this.doFindvalue(key, peer);
      });

      await new Promise(r => setTimeout(r, 5000));
      if (opt && opt.ownerId) {
        const ownerId = opt.ownerId;
        const peers = this.f.getClosePeers(ownerId);
        peers.forEach(peer => {
          this.doFindvalue(ownerId, peer);
        });
        await new Promise(r => setTimeout(r, 5000));
      }
      reject("findvalue timeout");
    });
  }

  async doFindvalue(key: string, peer: WebRTC) {
    console.log("dofindvalue", peer.nodeId);
    const sendData: FindValue = { targetKey: key };
    peer.send(networkFormat(this.nodeId, def.FINDVALUE, sendData), "kad");
  }

  connect(peer: WebRTC) {
    console.log("kad connect");
    if (this.state.isFirstConnect) this.callback.onConnect();
    this.state.isFirstConnect = false;
    this.addknode(peer);
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
    return new Promise<any>(async (resolve, reject) => {
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
    return new Promise<any>(async (resolve, reject) => {
      const r = this.ref;
      const peer = (r[target] = new WebRTC());
      peer.makeAnswer(sdp);
      console.log("kad answer", target);

      const timeout = setTimeout(() => {
        reject("kad answer timeout");
      }, 5 * 1000);

      peer.signal = sdp => {
        const _ = this.f.getPeerFromnodeId(proxy);
        const hash = sha1(Math.random().toString()).toString();
        const sendData: StoreFormat = {
          sender: this.nodeId,
          key: target,
          value: { sdp },
          pubKey: this.cypher.pubKey,
          hash,
          sign: this.cypher.encrypt(hash)
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
    return new Promise<any>(async (resolve, reject) => {
      const peer = this.f.getPeerFromnodeId(target);
      if (peer) {
        peer.send(networkFormat(this.nodeId, def.SEND, data), "kad");
        resolve(true);
      } else {
        const close = this.f.getCloseEstPeer(target);
        if (!close) return;
        const result = await this.findNode(target, close).catch(console.log);
        if (!result) return;
        result.send(data, "p2p");
        resolve(true);
      }
      await new Promise(r => setTimeout(r, 10 * 1000));
      reject("send timeout");
    });
  }

  private onCommand(message: message) {
    switch (message.label) {
      case "kad":
        const buffer: Buffer = Buffer.from(message.data);
        try {
          const networkLayer: network = bson.deserialize(buffer);
          console.log("oncommand kad", { message }, { networkLayer });
          if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
            this.dataList.push(networkLayer.hash);
            this.onRequest(networkLayer);
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "p2p":
        excuteEvent(this.events.p2p, message.data);
        break;
    }
  }

  private onRequest(network: any) {
    this.responder.response(network.type, network);
    this.maintain(network);
  }
}
