import Peer from "../../modules/peer";

export type Option = { kBucketSize: number };

export default class Kbucket {
  private k = 20;
  peers: { kid: string; peer: Peer }[] = [];

  constructor(opt: Partial<Option>) {
    const { kBucketSize } = opt;
    const { k } = this;

    this.k = kBucketSize || k;
  }

  add(peer: Peer) {
    if (this.peers.map(item => item.kid).includes(peer.kid)) return false;

    if (this.peers.length > this.k) {
      const discon = this.peers.pop();
      if (discon) {
        discon.peer.disconnect();
      }
    }

    this.peers.push({ kid: peer.kid, peer });

    peer.onDisconnect.subscribe(() => {
      this.peers = this.peers.filter(find => find.kid !== peer.kid);
    });

    return true;
  }

  get length() {
    return Object.keys(this.peers).length;
  }
}
