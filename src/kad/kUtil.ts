import WebRTC from "webrtc4me";
import { distance } from "kad-distance";

export default class KUtil {
  kbuckets: Array<Array<WebRTC>>;
  k: number;
  constructor(k: number, kbuckets: Array<Array<WebRTC>>) {
    this.k = k;
    this.kbuckets = kbuckets;
  }

  getAllPeers(): Array<WebRTC> {
    return Array.prototype.concat.apply([], this.kbuckets);
  }

  getPeer(targetId: string): WebRTC | undefined {
    let ans;
    this.getAllPeers().forEach(peer => {
      if (peer.nodeId === targetId) ans = peer;
    });
    return ans;
  }

  getCloseEstPeersList(key: string, opt = { excludeId: null }) {
    const dist = this.getCloseEstDist(key);
    const list: Array<WebRTC> = [];
    this.getAllPeers().forEach(peer => {
      if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
        if (distance(key, peer.nodeId) === dist) {
          list.push(peer);
        }
      }
    });
    return list;
  }

  getCloseIDs(targetID: string) {
    let list: Array<string> = [];
    this.getAllPeers().forEach(peer => {
      if (peer.nodeId !== targetID) {
        if (list.length < this.k) {
          list.push(peer.nodeId);
        } else {
          for (let i = 0; i < list.length; i++) {
            if (distance(list[i], targetID) > distance(peer.nodeId, targetID)) {
              list[i] = peer.nodeId;
            }
          }
        }
      }
    });
    return list;
  }

  getCloseEstIdsList(key: string, opt = { excludeId: null }) {
    const peers = this.getCloseEstPeersList(key, opt);
    const list: Array<string> = [];
    peers.forEach(peer => list.push(peer.nodeId));
    return list;
  }

  getPeerFromnodeId(nodeId: string) {
    return this.getAllPeers().find(peer => {
      return peer.nodeId === nodeId;
    });
  }

  getCloseEstPeer(_key: string, opt = { excludeId: null }): WebRTC | undefined {
    let mini = 160;
    let closePeer;
    this.kbuckets.forEach(kbucket => {
      kbucket.forEach(peer => {
        console.log("distance", peer.nodeId, distance(_key, peer.nodeId));
        if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
          if (distance(_key, peer.nodeId) < mini) {
            mini = distance(_key, peer.nodeId);
            closePeer = peer;
          }
        }
      });
    });
    return closePeer;
  }

  getCloseEstDist(key: string) {
    const peers = this.getAllPeers();
    const mini = peers.reduce((a, b) => {
      if (distance(a.nodeId, key) < distance(b.nodeId, key)) return a;
      else return b;
    });
    return distance(mini.nodeId, key);
  }

  getCloseIds(targetId: string) {
    const list: Array<string> = [];
    this.getAllPeers().forEach(peer => {
      if (peer.nodeId !== targetId) {
        if (list.length < this.k) {
          list.push(peer.nodeId);
        } else {
          for (let i = 0; i < list.length; i++) {
            if (distance(list[i], targetId) > distance(peer.nodeId, targetId)) {
              list[i] = peer.nodeId;
            }
          }
        }
      }
    });
    return list;
  }

  getAllPeerIds() {
    return this.getAllPeers().map(peer => {
      if (peer) {
        return peer.nodeId;
      }
    });
  }

  isPeerExist(id: string): boolean {
    const ids = this.getAllPeerIds();
    if (ids) {
      return ids.includes(id);
    } else {
      return false;
    }
  }

  getPeerNum(): number {
    const arr = this.getAllPeers();
    return arr.length;
  }

  cleanDiscon() {
    this.kbuckets.forEach((kbucket, i) => {
      this.kbuckets[i] = kbucket.filter(peer => !peer.isDisconnected);
    });
  }

  getKbucketNum() {
    let num = 0;
    this.kbuckets.forEach(kbucket => {
      if (kbucket.length > 0) num++;
    });
    return num;
  }

  isNodeExist(nodeId: string) {
    return this.getAllPeerIds().includes(nodeId);
  }

  getClosePeers(targetId: string) {
    const list: Array<WebRTC> = [];
    this.getAllPeers().forEach(peer => {
      if (peer.nodeId !== targetId) {
        if (list.length < this.k) {
          list.push(peer);
        } else {
          for (let i = 0; i < list.length; i++) {
            if (
              distance(list[i].nodeId, targetId) >
              distance(peer.nodeId, targetId)
            ) {
              list[i] = peer;
            }
          }
        }
      }
    });
    return list;
  }
}
