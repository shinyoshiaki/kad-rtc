import Ktable from "../../ktable";
import Peer, { PeerModule } from "../../modules/peer/webrtc";
import sha1 from "sha1";
import listenFindnode from "./listen";
import findNode from ".";

const num = 4;

describe("findnode", () => {
  test(
    "findnode",
    async () => {
      const nodes: Ktable[] = [];
      {
        const kOffer = new Ktable(sha1("0").toString());
        const kAnswer = new Ktable(sha1("1").toString());

        const offer = new Peer(kAnswer.kid);
        const offerSdp = await offer.createOffer();
        const answer = new Peer(kOffer.kid);
        const answerSdp = await answer.setOffer(offerSdp);
        await offer.setAnswer(answerSdp);

        kOffer.add(offer);
        kAnswer.add(answer);

        listenFindnode(PeerModule, offer, kOffer);
        listenFindnode(PeerModule, answer, kAnswer);

        nodes.push(kOffer);
        nodes.push(kAnswer);
      }

      for (let i = 2; i < 2 + num; i++) {
        const pop = nodes.slice(-1)[0];
        const push = new Ktable(sha1(i.toString()).toString());

        const offer = new Peer(push.kid);
        const offerSdp = await offer.createOffer();
        const answer = new Peer(pop.kid);
        const answerSdp = await answer.setOffer(offerSdp);
        await offer.setAnswer(answerSdp);

        pop.add(offer);
        push.add(answer);

        listenFindnode(PeerModule, offer, pop);
        listenFindnode(PeerModule, answer, push);

        nodes.push(push);
      }

      {
        const length = nodes.filter(node => node.getAllPeers().length > 0)
          .length;
        expect(length).toBe(6);
      }

      {
        const node = nodes[0];
        const peers = await findNode(
          PeerModule,
          node.kid,
          node.findNode(node.kid)
        );
        expect(peers.length).not.toBe(0);
      }
    },
    1000 * 6000
  );
});
