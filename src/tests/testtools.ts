import {
  DependencyInjection,
  KeyValueStore,
  PeerCreator,
  dependencyInjection,
  findNode,
  listeners
} from "../kademlia";

import sha1 from "sha1";

export class Count {
  private count = 0;
  constructor(private times: number, private resolve: any) {}

  check = () => {
    this.count++;
    if (this.count === this.times) this.resolve();
  };
}

export async function testSetupNodes(
  kBucketSize: number,
  num: number,
  PeerModule: PeerCreator,
  timeout: number
) {
  const nodes: DependencyInjection[] = [];

  for (let i = 0; i < num; i++) {
    if (nodes.length === 0) {
      const node = dependencyInjection(
        sha1(i.toString()).toString(),
        { peerCreate: PeerModule, kvs: new KeyValueStore() },
        { kBucketSize, timeout }
      );
      nodes.push(node);
    } else {
      const pre = nodes.slice(-1)[0];
      const push = dependencyInjection(
        sha1(i.toString()).toString(),
        { peerCreate: PeerModule, kvs: new KeyValueStore() },
        { kBucketSize, timeout }
      );
      const offer = PeerModule(push.kTable.kid);
      const offerSdp = await offer.createOffer();
      const answer = PeerModule(pre.kTable.kid);
      const answerSdp = await answer.setOffer(offerSdp);
      await offer.setAnswer(answerSdp);

      listeners(offer, pre);
      listeners(answer, push);

      nodes.push(push);
    }
  }

  for (let node of nodes) {
    await findNode(node.kTable.kid, node);
  }
  return nodes;
}
