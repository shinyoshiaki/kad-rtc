import * as util from "../lib/util";

export default class KadFunc {
  constructor(kLength, _kbuckets) {
    this.kLength = kLength;
    this.kbuckets = _kbuckets;
  }

  distance(a16, b16) {
    let a = util
      .convertBase(a16, 16, 2)
      .toString()
      .split("");
    let b = util
      .convertBase(b16, 16, 2)
      .toString()
      .split("");

    let xor;
    if (a.length > b.length) xor = new Array(a.length);
    else xor = new Array(b.length);

    for (let i = 0; i < xor.length; i++) {
      xor[i] = parseInt(a[i], 10) ^ parseInt(b[i], 10);
    }
    let xored = xor.toString().replace(/,/g, "");
    let n10 = parseInt(util.convertBase(xored, 2, 10).toString(), 10);

    let n, i;
    for (i = 0; ; i++) {
      n = 2 ** i;
      if (n > n10) break;
    }

    return i;
  }

  getCloseEstPeer(_key, opt = { excludeId: null }) {
    let mini = 160;
    let closePeer;
    this.kbuckets.forEach(kbucket => {
      kbucket.forEach(peer => {
        console.log("distance", peer.nodeId, this.distance(_key, peer.nodeId));
        if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
          if (this.distance(_key, peer.nodeId) < mini) {
            mini = this.distance(_key, peer.nodeId);
            closePeer = peer;
          }
        }
      });
    });
    return closePeer;
  }

  getCloseEstPeersList(key, opt = { excludeId: null }) {
    const dist = this.getCloseEstDist(key);
    const list = [];
    this.getAllPeers().forEach(peer => {
      if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
        if (this.distance(key, peer.nodeId) === dist) {
          list.push(peer);
        }
      }
    });
    return list;
  }

  getCloseEstIdsList(key, opt = { excludeId: null }) {
    const peers = this.getCloseEstPeersList(key, opt);
    const list = [];
    peers.forEach(peer => list.push(peer.nodeId));
    return list;
  }

  getAllPeers() {
    let peers = [];
    this.kbuckets.forEach(kbucket => {
      kbucket.forEach(peer => {
        peers.push(peer);
      });
    });
    return peers;
  }

  getAllPeerIds() {
    let peerIds = [];
    this.getAllPeers().forEach(peer => {
      peerIds.push(peer.nodeId);
    });
    return peerIds;
  }

  getPeerNum() {
    return this.getAllPeers.length;
  }

  getKbucketNum() {
    let num = 0;
    this.kbuckets.forEach(kbucket => {
      if (kbucket.length > 0) num++;
    });
    return num;
  }
  
  getCloseIDs(targetID) {
    let list = [];
    this.getAllPeers().forEach(peer => {
      if (peer.nodeId !== targetID) {
        if (list.length < this.kLength) {
          list.push(peer.nodeId);
        } else {
          for (let i = 0; i < list.length; i++) {
            if (
              this.distance(list[i], targetID) >
              this.distance(peer.nodeId, targetID)
            ) {
              list[i] = peer.nodeId;
            }
          }
        }
      }
    });
    return list;
  }

  getCloseEstDist(_key) {
    let mini = 160;
    this.kbuckets.forEach(kbucket => {
      kbucket.forEach(peer => {
        if (this.distance(_key, peer.nodeId) < mini) {
          mini = this.distance(_key, peer.nodeId);
        }
      });
    });
    return mini;
  }

  getPeerFromnodeId(nodeId) {
    return this.getAllPeers().find(peer => {
      return peer.nodeId === nodeId;
    });
  }

  isNodeExist(nodeId) {
    return this.getAllPeerIds().includes(nodeId);
  }

  isNodeIdCloseEst(nodeId, target) {
    const peer = this.getCloseEstPeer(target);
    const peerDist = this.distance(peer.nodeId, target);
    const myDist = this.distance(nodeId, target);
    console.log("isNodeIdCloseEst peerDist", peerDist, "myDist", myDist);
    if (myDist <= peerDist) {
      return true;
    } else {
      return false;
    }
  }

  isSomeOfKbucketFull() {
    let full = false;
    this.kbuckets.forEach(kbucket => {
      if (kbucket.length === this.kLength) {
        full = true;
        return 0;
      }
    });
    if (full) {
      console.log("isSomeOfKbucketFull");
    }
    return full;
  }
}
