import Kbucket, { Option as OptBucket } from "./kbucket";
import Peer from "../implements/peer";
import { distance } from "kad-distance";

export type Option = OptBucket;

export default class Ktable {
  private kbuckets: Kbucket[] = [];
  private k = 20;

  constructor(public kid: string, opt: Partial<Option>) {
    const { k } = this;
    const { kBucketSize } = opt;

    this.k = kBucketSize || k;

    this.kbuckets = [...Array(160)].map(() => new Kbucket(opt));
  }

  add(peer: Peer) {
    const length = distance(this.kid, peer.kid);
    const kbucket = this.kbuckets[length];
    kbucket.add(peer);
  }

  getAllPeers = (): Peer[] => {
    const { kbuckets } = this;
    console.log(
      kbuckets
        .filter(kbucket => kbucket.length > 0)
        .map(kbucket =>
          Object.keys(kbucket.peers).map(key => kbucket.peers[key])
        )
    );
    return kbuckets
      .filter(kbucket => kbucket.length > 0)
      .map(kbucket => Object.keys(kbucket.peers).map(key => kbucket.peers[key]))
      .flatMap(item => item);
  };

  getPeer = (kid: string): Peer | undefined =>
    this.getAllPeers().find(peer => peer.kid === kid);

  findNode(kid: string): Peer[] {
    const { k } = this;
    return this.getAllPeers()
      .sort((a, b) => distance(a.kid, kid) - distance(b.kid, kid))
      .slice(0, k);
  }
}
