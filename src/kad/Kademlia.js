import WebRTC from "simple-datachannel";
import Helper from "./KUtil";
import Events from "events";
import sha1 from "sha1";
import KResponder from "./KResponder";
import def from "./KConst";

let buffer = {};

export function networkFormat(nodeId, type, data) {
  let packet = {
    layer: "networkLayer",
    type: type,
    nodeId: nodeId,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = sha1(JSON.stringify(packet));
  return JSON.stringify(packet);
}

export default class Kademlia {
  constructor(_nodeId = null) {
    if (_nodeId !== null) {
      console.log("start kad", _nodeId);
      this.k = 20;
      this.nodeId = _nodeId;
      this.dataList = [];
      this.keyValueList = [];
      this.failPeerList = {};
      this.ref = {};
      this.ev = new Events.EventEmitter();
      this.pingResult = {};
      this.state = {
        isOffer: false,
        findNode: "",
        buffer: {},
        hash: {}
      };

      this.kbuckets = new Array(160);
      for (let i = 0; i < 160; i++) {
        let kbucket = [];
        this.kbuckets[i] = kbucket;
      }

      this.f = new Helper(this.k, this.kbuckets);
      this.kresponder = new KResponder(this);
    }
  }

  async ping(peer) {
    console.log("ping");

    const sendData = { target: peer.nodeId };
    peer.send(networkFormat(this.nodeId, def.PING, sendData), "kad");

    this.pingResult[peer.nodeId] = false;

    await setTimeout(() => {
      if (this.pingResult[peer.nodeId]) {
        console.log("ping success");
        return true;
      } else {
        console.log("ping fail", peer.nodeId);
        peer.isDisconnected = true;
        this.cleanDiscon();
        this.ev.emit(def.DISCONNECT_KNODE);
        return false;
      }
    }, 3 * 1000);
  }

  storeFormat(sender, key, value) {
    const sendData = {
      sender,
      key,
      value
    };
    return networkFormat(this.nodeId, def.STORE, sendData);
  }

  store(sender, key, value) {
    const peer = this.f.getCloseEstPeer(key);

    console.log(def.STORE, "next", peer.nodeId, "target", key);

    const result = this.ping(peer);

    if (result) {
      peer.send(this.storeFormat(sender, key, value), "kad");
      console.log("store done", this.storeFormat(sender, key, value));
    } else {
      console.log("store faile");
    }
  }

  findNode(targetId, peer) {
    const result = this.ping(peer);
    if (result) {
      console.log("findnode", targetId);
      this.state.findNode = targetId;
      const sendData = { targetKey: targetId };
      peer.send(networkFormat(this.nodeId, def.FINDNODE, sendData), "kad");
    }
  }

  findValue(nodeId, key) {
    return new Promise((resolve, reject) => {
      this.doFindvalue(nodeId, key);
      this.ev.on(def.FINDVALUE, data => {
        console.log("findValue success");
        resolve(data);
      });
      setTimeout(() => {
        console.log("findValue fail");
        reject();
      }, 10 * 1000);
    });
  }

  doFindvalue(nodeId, key) {
    const peer = this.f.getCloseEstPeer(nodeId);
    const result = this.ping(peer);
    if (result) {
      peer.send(
        networkFormat(this.nodeId, def.FINDVALUE, {
          targetNode: nodeId,
          targetKey: key
        }),
        "kad"
      );
    }
  }

  addknode(peer) {
    peer.ev.on("data", data => {
      console.log("on data", data);
      this.onCommand(data);
    });

    peer.ev.on("disconnect", () => {
      console.log("kad node disconnected");
      this.cleanDiscon();
    });

    if (!this.f.isNodeExist(peer.nodeId)) {
      const num = this.f.distance(this.nodeId, peer.nodeId);
      const kbucket = this.kbuckets[num];
      kbucket.push(peer);

      console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
      this.ev.emit(def.ADD_KNODE);

      if (this.f.getKbucketNum() < this.k) {
        this.findNode(this.nodeId, peer);
      } else {
        console.log("kbucket ready", this.f.getKbucketNum());
      }
    }
  }

  onRequest(datalink) {
    const network = JSON.parse(datalink);
    this.kresponder.response(network.type, network);
    this.maintain(network);
  }

  cleanDiscon() {
    this.kbuckets.forEach((kbucket, i) => {
      this.kbuckets[i] = kbucket.filter(peer => !peer.isDisconnected);
    });
  }

  maintain(network) {
    const inx = this.f.distance(this.nodeId, network.nodeId);
    const kbucket = this.kbuckets[inx];

    kbucket.forEach((peer, i) => {
      if (peer.nodeId === network.nodeId) {
        console.log("maintain", "Moves it to the tail of the list");
        kbucket.splice(i, 1);
        kbucket.push(peer);
        return 0;
      }
    });

    if (kbucket.length > this.k) {
      console.log("maintain", "bucket fulled", network.nodeId);
      //オンラインかどうかはwrtcの特性上常にわかっているのでキュー
      kbucket.splice(0, 1);
    }
  }

  addFailPeerList(target) {
    if (this.failPeerList[target]) {
      this.failPeerList[target] = this.failPeerList[target] + 1;
    } else {
      this.failPeerList[target] = 0;
    }
  }

  offer(target, proxy = null) {
    return new Promise((resolve, reject) => {
      const r = this.ref;
      const peer = (r[target] = new WebRTC());
      peer.makeOffer();
      peer.connecting(target);

      peer.ev.on("signal", sdp => {
        console.log("kad offer store", target);
        if (this.f.getCloseEstPeer(target) !== target)
          this.store(this.nodeId, target, { sdp, proxy });
      });

      peer.ev.on("connect", () => {
        console.log("kad offer connected", target);
        console.log(this.kbuckets);
        r[target].connected();
        resolve(peer);
      });

      setTimeout(() => {
        this.addFailPeerList(target);
        reject("timeout");
      }, 3 * 1000);
    });
  }

  answer(target, sdp, proxy = null) {
    return new Promise((resolve, reject) => {
      const r = this.ref;
      const peer = (r[target] = new WebRTC());
      peer.makeAnswer(sdp);
      peer.connecting(target);
      console.log("kad answer", target);

      peer.ev.on("signal", sdp => {
        this.f
          .getPeerFromnodeId(proxy)
          .send(this.storeFormat(this.nodeId, target, { sdp }), "kad");
      });

      peer.ev.on("connect", () => {
        console.log("kad answer connected", target);
        console.log(this.kbuckets);
        peer.connected();

        resolve(peer);
      });

      setTimeout(() => {
        this.addFailPeerList(target);
        reject("timeout");
      }, 3 * 1000);
    });
  }

  onCommand(datachannel) {
    const command = {};

    command.kad = dataLink => {
      const networkLayer = JSON.parse(dataLink);

      if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
        this.dataList.push(networkLayer.hash);

        this.cleanDiscon();
        this.onRequest(dataLink);
        this.ev.emit(def.ONCOMMAND, networkLayer);
      }
    };

    command.data = ab => {
      console.log("received ab", ab);
      try {
        const json = JSON.parse(ab);
        if (json.type === "start") {
          this.state.hash[datachannel.nodeId] = json.data;
        } else if (json.type === "end") {
          const filehash = sha1(buffer[datachannel.nodeId]);
          if (filehash === this.state.hash[datachannel.nodeId]) {
            this.keyValueList[filehash] = buffer[datachannel.nodeId];
            this.ev.emit("receiveFile", buffer[datachannel.nodeId]);
            this.ev.emit(def.FINDVALUE, buffer[datachannel.nodeId]);
            buffer[datachannel.nodeId] = [];
          } else {
            console.log(
              "hash incorrect",
              filehash,
              this.state.hash[datachannel.nodeId]
            );
          }
        }
      } catch (_) {
        if (!buffer[datachannel.nodeId]) {
          buffer[datachannel.nodeId] = [];
        }
        buffer[datachannel.nodeId].push(ab);
      }
    };
    command[datachannel.label](datachannel.data);
  }
}
