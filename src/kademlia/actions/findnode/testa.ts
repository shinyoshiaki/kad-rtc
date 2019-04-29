import { PeerModule } from "../../modules/peer/mock";
import Peer from "../../modules/peer/base";
import sha1 from "sha1";
import findNode from ".";
import { dependencyInjection, DependencyInjection } from "../../di";
import { listeners } from "../../listeners";

const kBucketSize = 8;
const num = kBucketSize * 2;

export async function testSetupNodes(kBucketSize: number, num: number) {
  const nodes: DependencyInjection[] = [];

  const kOffer = dependencyInjection(sha1("0").toString(), PeerModule, {
    kBucketSize
  });
  const kAnswer = dependencyInjection(sha1("1").toString(), PeerModule, {
    kBucketSize
  });

  const offer = PeerModule(kAnswer.kTable.kid);
  const offerSdp = await offer.createOffer();
  const answer = PeerModule(kOffer.kTable.kid);
  const answerSdp = await answer.setOffer(offerSdp);
  await offer.setAnswer(answerSdp);

  kOffer.kTable.add(offer);
  listeners(offer, kOffer);

  kAnswer.kTable.add(answer);
  listeners(answer, kAnswer);

  nodes.push(kOffer);
  nodes.push(kAnswer);

  for (let i = 2; i < 2 + num; i++) {
    const pop = nodes.slice(-1)[0];
    const push = dependencyInjection(
      sha1(i.toString()).toString(),
      PeerModule,
      { kBucketSize }
    );

    const offer = PeerModule(push.kTable.kid);
    const offerSdp = await offer.createOffer();
    const answer = PeerModule(pop.kTable.kid);
    const answerSdp = await answer.setOffer(offerSdp);
    await offer.setAnswer(answerSdp);

    pop.kTable.add(offer);
    listeners(offer, pop);
    push.kTable.add(answer);
    listeners(answer, push);

    nodes.push(push);
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

        for (
          let pre = "";
          pre !== node.kTable.getHash(word);
          pre = node.kTable.getHash(word)
        ) {
          target = await findNode(word, node);

          if (target) {
            break;
          }
        }

        if (!target) {
          expect(true).toBe(true);
        }
        expect(target).not.toBe(undefined);
      };

      for (let word of nodes.slice(1)) {
        await search(word.kTable.kid);
      }

      await new Promise(r => setTimeout(r, 0));
    },
    1000 * 6000
  );
});
