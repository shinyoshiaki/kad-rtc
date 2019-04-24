import Peer from "../../modules/peer";

export type Option = { kBucketSize: number };

export default class Kbucket {
  private k = 20;
  peers: { [key: string]: Peer } = {};

  constructor(opt: Partial<Option>) {
    const { kBucketSize } = opt;
    const { k } = this;

    this.k = kBucketSize || k;
  }

  add(peer: Peer) {
    this.peers[peer.kid] = peer;

    peer.onDisconnect.subscribe(() => {
      delete this.peers[peer.kid];
    });
  }

  get length() {
    return Object.keys(this.peers).length;
  }
}
