import { PeerModule } from "../../modules/peer/webrtc";
import Peer from "../../modules/peer/base";
import sha1 from "sha1";
import findNode from ".";
import { dependencyInjection, DependencyInjection } from "../../di";
import { listeners } from "../../listeners";
import { KvsModule } from "../../modules/kvs/base";

const kBucketSize = 8;
const num = 10;

export async function testSetupNodes(kBucketSize: number, num: number) {
  const nodes: DependencyInjection[] = [];

  for (let i = 0; i < num; i++) {
    if (nodes.length === 0) {
      const node = dependencyInjection(
        sha1(i.toString()).toString(),
        { peerCreate: PeerModule, kvs: KvsModule },
        {
          kBucketSize
        }
      );
      nodes.push(node);
    } else {
      const pre = nodes.slice(-1)[0];
      const push = dependencyInjection(
        sha1(i.toString()).toString(),
        { peerCreate: PeerModule, kvs: KvsModule },
        {
          kBucketSize
        }
      );
      const offer = PeerModule(push.kTable.kid);
      const offerSdp = await offer.createOffer();
      const answer = PeerModule(pre.kTable.kid);
      const answerSdp = await answer.setOffer(offerSdp);
      await offer.setAnswer(answerSdp);

      pre.kTable.add(offer);
      listeners(offer, pre);
      push.kTable.add(answer);
      listeners(answer, push);

      nodes.push(push);
    }
  }

  for (let node of nodes) {
    await findNode(node.kTable.kid, node);
  }
  return nodes;
}

describe("findnode", () => {
  test(
    "findnode",
    async () => {
      const nodes = await testSetupNodes(kBucketSize, num);

      const search = async (word: string) => {
        const node = nodes[0];

        let target: undefined | Peer;

        let pre = "",
          trytime = 0;
        for (
          ;
          pre !== node.kTable.getHash(word);
          pre = node.kTable.getHash(word), trytime++
        ) {
          target = await findNode(word, node);

          if (target) {
            break;
          }
        }

        if (!target) {
          const now = node.kTable.getHash(word);
          expect(pre).toBe(now);
        } else {
          expect(target).not.toBe(undefined);
        }
      };

      for (let word of nodes.slice(1)) {
        await search(word.kTable.kid);
      }

      await new Promise(r => setTimeout(r, 0));

      nodes.forEach(node =>
        node.kTable.allPeers.forEach(peer => peer.disconnect())
      );
    },
    1000 * 6000
  );
});
