import Kademlia, { KeyValueStore, Options, PeerCreater } from "../kademlia";

import sha1 from "sha1";

export async function testSetupNodes(
  num: number,
  PeerModule: PeerCreater,
  opt: Options
) {
  const modules = { peerCreate: PeerModule, kvs: new KeyValueStore() };
  const nodes: Kademlia[] = [];

  for (let i = 0; i < num; i++) {
    if (nodes.length === 0) {
      const node = new Kademlia(sha1(i.toString()), modules, opt);
      nodes.push(node);
    } else {
      const pre = nodes.slice(-1)[0];
      const push = new Kademlia(sha1(i.toString()), modules, opt);

      const pushOffer = PeerModule(pre.di.kTable.kid);
      const offerSdp = await pushOffer.createOffer();
      const preAnswer = PeerModule(push.di.kTable.kid);
      const answerSdp = await preAnswer.setOffer(offerSdp);
      await pushOffer.setAnswer(answerSdp);

      push.add(pushOffer);
      pre.add(preAnswer);

      await push.findNode(push.kid);
      await pre.findNode(pre.kid);

      nodes.push(push);
    }
  }

  return nodes;
}
