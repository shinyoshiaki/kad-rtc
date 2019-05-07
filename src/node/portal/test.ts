import Portal from ".";
import aport from "aport";

const kBucketSize = 4;
const num = 8;

async function testSetupNodes(kBucketSize: number, num: number) {
  const nodes: Portal[] = [];
  const firstport = await aport();
  const first = new Portal({ port: firstport });
  nodes.push(first);

  for (let i = 1, port = firstport; i < num; i++) {
    const newport = await aport();
    const node = new Portal({
      target: { url: "localhost", port },
      port: newport,
      kadOption: { kBucketSize }
    });
    await node.onConnect.asPromise();
    nodes.push(node);
    port = newport;
  }
  return nodes;
}

describe("portal", () => {
  test(
    "findnode",
    async () => {
      const nodes = await testSetupNodes(kBucketSize, num);

      const search = async (word: string) => {
        const node = nodes[0];

        const res = await node.kademlia.findNode(word);
        if (!res) {
          res;
        }
        expect(res).not.toBe(undefined);
      };

      for (let node of nodes.slice(1)) {
        await search(node.kademlia.di.kTable.kid);
      }

      await new Promise(r => setTimeout(r, 0));

      nodes.forEach(node => {
        node.close();
      });

      nodes.forEach(node =>
        node.kademlia.di.kTable.allPeers.forEach(peer => peer.disconnect())
      );
    },
    1000 * 6000
  );
});
