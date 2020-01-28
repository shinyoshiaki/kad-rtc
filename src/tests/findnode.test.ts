import {
  DependencyInjection,
  Peer,
  PeerMockModule,
  PeerModule,
  findNode
} from "../kademlia";

import { testSetupNodes } from "./testtools";

const kBucketSize = 8;
const num = 10;

describe("findnode", () => {
  const menu = async (nodes: DependencyInjection[]) => {
    const search = async (word: string) => {
      const node = nodes[0];

      let target: undefined | Peer;

      let pre = "",
        tryTimes = 0;
      for (
        ;
        pre !== node.kTable.getHash(word);
        pre = node.kTable.getHash(word), tryTimes++
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
  };

  test(
    "peer",
    async () => {
      const nodes = await testSetupNodes(
        kBucketSize,
        num,
        PeerMockModule,
        60_000 * 10
      );
      await menu(nodes);
    },
    60_000 * 100
  );
});
