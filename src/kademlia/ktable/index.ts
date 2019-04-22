import Kbucket, { Option as OptBucket } from "./kbucket";
import { distance } from "kad-distance";
import Peer from "../modules/peer";

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

  getAllPeers = (): Peer[] =>
    this.kbuckets
      .map(kbucket => Object.keys(kbucket.peers).map(key => kbucket.peers[key]))
      .flatMap(item => item);

  getPeer = (kid: string): Peer | undefined =>
    this.getAllPeers().find(peer => peer.kid === kid);

  findNode = (kid: string): Peer[] =>
    this.getAllPeers()
      .sort((a, b) => distance(a.kid, kid) - distance(b.kid, kid))
      .slice(0, this.k);
}
