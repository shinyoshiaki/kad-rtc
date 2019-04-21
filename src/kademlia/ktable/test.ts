import Ktable from ".";
import sha1 from "sha1";
import Kbucket from "./kbucket";
import Peer from "../implements/peer";
import Event from "../../utill/event";
import { distance } from "kad-distance";

class PeerTest implements Peer {
  onDisconnect = new Event<undefined>();
  constructor(public kid: string) {}
}

describe("ktable", () => {
  const kBucketSize = 4;

  test("constructor", () => {
    const ktable = new Ktable(sha1("a").toString(), { kBucketSize });
    const kbuckets: Kbucket[] = (ktable as any).kbuckets;
    const k: number = (ktable as any).k;

    expect(kbuckets.length).toBe(160);
    expect(k).toBe(kBucketSize);
  });

  test("findnode", () => {
    const ktable = new Ktable(sha1("a").toString(), { kBucketSize });
    const { kid } = ktable;

    [...Array(10)].forEach((_, i) => {
      ktable.add(new PeerTest(sha1(i.toString()).toString()));
    });

    const peers = ktable.findNode(kid);

    expect(
      distance(kid, peers[0].kid) <
        distance(ktable.getAllPeers()[kBucketSize].kid, kid)
    ).toBe(true);
  });
});
