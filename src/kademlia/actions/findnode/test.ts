import Peer, { PeerModule } from "../../modules/peer/mock";
import sha1 from "sha1";
import findNode from ".";
import { dependencyInjection, DependencyInjection } from "../../di";
import { listeners } from '../../listeners';

const kBucketSize = 8;
const num = 5;

export async function setupNodes(kBucketSize: number, num: number) {
  const nodes: DependencyInjection[] = [];

  const kOffer = dependencyInjection(sha1("0").toString(), PeerModule, {
    kBucketSize
  });
  const kAnswer = dependencyInjection(sha1("1").toString(), PeerModule, {
    kBucketSize
  });

  const offer = new Peer(kAnswer.kTable.kid);
  const offerSdp = await offer.createOffer();
  const answer = new Peer(kOffer.kTable.kid);
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

    const offer = new Peer(push.kTable.kid);
    const offerSdp = await offer.createOffer();
    const answer = new Peer(pop.kTable.kid);
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
      const nodes = await setupNodes(kBucketSize, num);

      const search = async (word: string) => {
        const node = nodes[0];

        let target: any;

        let trytime = 0;
        for (let pre = ""; ; trytime++) {
          const res = await findNode(word, node);
          if (pre === res.hash) {
            break;
          }
          if (res.target) {
            target = res.target;
            break;
          }
          pre = res.hash;
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
