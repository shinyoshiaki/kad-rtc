import Kbucket, { Option as OptBucket } from "./kbucket";
import { distance } from "kad-distance";
import Peer from "../modules/peer/base";
import sha1 from "sha1";
import Candidates from "./candidates";

export type Option = OptBucket;

export default class Ktable {
  private kbuckets: Kbucket[] = [];
  private k = 20;
  candidates = new Candidates();

  constructor(public kid: string, opt: Partial<Option> = {}) {
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

  findNode = (kid: string): Peer[] =>
    this.allPeers
      .sort((a, b) => distance(a.kid, kid) - distance(b.kid, kid))
      .slice(0, this.k);

  get allPeers() {
    return this.kbuckets
      .map(kbucket => kbucket.peers.map(bucket => bucket.peer))
      .flatMap(item => item);
  }

  get allKids() {
    return this.allPeers.map(v => v.kid);
  }

  get kBucketSize() {
    return this.k;
  }

  getPeer = (kid: string): Peer | undefined =>
    this.allPeers.find(peer => peer.kid === kid);

  getHash = (kid: string) =>
    sha1(
      JSON.stringify(
        this.findNode(kid)
          .map(v => v.kid)
          .sort()
      )
    ).toString();
}
