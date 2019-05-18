import Peer from "../../modules/peer/base";

import findNode from ".";
import { testSetupNodes } from "../../../utill/testtools";

const kBucketSize = 8;
const num = 10;

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
