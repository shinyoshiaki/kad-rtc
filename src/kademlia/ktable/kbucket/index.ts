import Peer from "../../modules/peer/base"

export type Option = { kBucketSize: number };

export default class Kbucket {
  private k = 20;
  peers: { kid: string; peer: Peer }[] = [];

  constructor(opt: Partial<Option> = {}) {
    const { kBucketSize } = opt;
    const { k } = this;

    this.k = kBucketSize || k;
  }

  add(peer: Peer) {
    if (this.peers.find(v => v.kid === peer.kid)) {
      this.peers = this.peers.filter(find => find.kid !== peer.kid);
    }

    this.peers.push({ kid: peer.kid, peer });

    if (this.peers.length > this.k) {
      this.peers.shift();
    }

    peer.onDisconnect.subscribe(() => {
      this.peers = this.peers.filter(find => find.kid !== peer.kid);
    });
  }

  get length() {
    return Object.keys(this.peers).length;
  }
}
