import Kbucket, { Option as OptBucket } from "./kbucket";

import { Pack } from "rx.mini";
import { Peer } from "../modules/peer/base";
import { distance } from "kad-distance";
import sha1 from "sha1";

export type Option = OptBucket;

export default class Ktable {
  readonly kbuckets: Kbucket[] = [];
  private k = 20;
  pack = Pack();
  onAdd = this.pack.event<Peer>();

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
    this.onAdd.execute(peer);
  }

  findNode = (kid: string): Peer[] =>
    this.allPeers
      .sort((a, b) => distance(a.kid, kid) - distance(b.kid, kid))
      .slice(0, this.k);

  get allPeers() {
    return this.kbuckets
      .map(kbucket => kbucket.peers.map(bucket => bucket.peer))
      .flatMap(peer => peer);
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

  rmPeer = (kid: string) => {
    const length = distance(this.kid, kid);
    const kbucket = this.kbuckets[length];
    kbucket.rmPeer(kid);
  };
}
