import Kbucket from "../kademlia/ktable/kbucket";
import Ktable from "../kademlia/ktable";
import { PeerMock } from "../kademlia/modules/peer/base";
import { distance } from "kad-distance";
import sha1 from "sha1";

class PeerTest extends PeerMock {}

describe("ktable", () => {
  const kBucketSize = 20;

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

    [...Array(100)].forEach((_, i) => {
      ktable.add(new PeerTest(sha1(i.toString()).toString()));
    });

    const peers = ktable.findNode(kid);

    expect(
      distance(kid, peers[0].kid) <
        distance(ktable.allPeers.slice(-1)[0].kid, kid)
    ).toBe(true);
  });
});
