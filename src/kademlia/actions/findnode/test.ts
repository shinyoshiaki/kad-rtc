import Ktable from "../../ktable";
import Peer, { PeerModule } from "../../modules/peer/webrtc";
import sha1 from "sha1";
import listenFindnode from "./listen";
import findNode from ".";

const kBucketSize = 8;
const num = 1;

describe("findnode", () => {
  test(
    "findnode",
    async () => {
      const nodes: Ktable[] = [];

      const kOffer = new Ktable(sha1("0").toString(), { kBucketSize });
      const kAnswer = new Ktable(sha1("1").toString(), { kBucketSize });

      const offer = new Peer(kAnswer.kid);
      const offerSdp = await offer.createOffer();
      const answer = new Peer(kOffer.kid);
      const answerSdp = await answer.setOffer(offerSdp);
      await offer.setAnswer(answerSdp);

      kOffer.add(offer);
      listenFindnode(PeerModule, offer, kOffer);
      kAnswer.add(answer);
      listenFindnode(PeerModule, answer, kAnswer);

      nodes.push(kOffer);
      nodes.push(kAnswer);

      for (let i = 2; i < 2 + num; i++) {
        const pop = nodes.slice(-1)[0];
        const push = new Ktable(sha1(i.toString()).toString(), { kBucketSize });

        const offer = new Peer(push.kid);
        const offerSdp = await offer.createOffer();
        const answer = new Peer(pop.kid);
        const answerSdp = await answer.setOffer(offerSdp);
        await offer.setAnswer(answerSdp);

        pop.add(offer);
        listenFindnode(PeerModule, offer, pop);
        push.add(answer);
        listenFindnode(PeerModule, answer, push);

        nodes.push(push);
      }
      for (let node of nodes) {
        await findNode(PeerModule, node.kid, node);
      }
      const search = async (word: string) => {
        const node = nodes[0];

        let target: any;

        for (let _ in [...Array(5)]) {
          target = await findNode(PeerModule, word, node);
          if (target) break;
        }

        expect(target).not.toBe(undefined);
      };

      for (let word of nodes) {
        if (word.kid === nodes[0].kid) continue;
        await search(word.kid);
      }

      await new Promise(r => setTimeout(r, 0));
    },
    1000 * 6000
  );
});
