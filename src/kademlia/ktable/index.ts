import Kbucket, { Option } from "./kbucket";
import Peer from "../implements/peer";
import { distance } from "kad-distance";

export default class Ktable {
  kbuckets: Kbucket[] = [];

  constructor(public kid: string, opt: Partial<Option>) {
    this.kbuckets = [...Array(160)].map(() => new Kbucket(opt));
  }

  add(peer: Peer) {
    const length = distance(this.kid, peer.kid);
    const kbucket = this.kbuckets[length];
    kbucket.add(peer);
  }

  private getAllPeer = (): Peer[] =>
    this.kbuckets.flatMap(kbucket =>
      Object.keys(kbucket.peers).map(key => kbucket.peers[key])
    );

  getPeer = (kid: string): Peer | undefined =>
    this.getAllPeer().find(peer => peer.kid === kid);
}
