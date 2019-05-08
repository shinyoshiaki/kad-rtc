import GuestNode from ".";
import aport from "aport";
import PortalNode from "../portal";

const kBucketSize = 8;
const num = 10; // 11以上で不安定

async function testSetupNodes(kBucketSize: number, num: number) {
  const portalPort = await aport();
  const nodes: (GuestNode | PortalNode)[] = [];

  nodes.push(new PortalNode({ port: portalPort }));

  for (let i = 0; i < num; i++) {
    const node = new GuestNode({
      target: { url: "localhost", port: portalPort }
    });
    if (i > 12) {
      i;
    }

    await node.onConnect.asPromise();
    nodes.push(node);
  }
  return nodes;
}

describe("guest", () => {
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

      (nodes[0] as PortalNode).close();

      await new Promise(r => setTimeout(r, 0));

      nodes.forEach(node =>
        node.kademlia.di.kTable.allPeers.forEach(peer => peer.disconnect())
      );
    },
    1000 * 6000
  );
});
