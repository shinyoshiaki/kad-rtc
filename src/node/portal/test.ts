import Portal from ".";
import { Count } from "../../utill/testtools";
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
    "p2p",
    async () => {
      const test = () =>
        new Promise<{ a: Portal; b: Portal }>(resolve => {
          const a = new Portal({ port: 50000 });
          const b = new Portal({
            port: 50001,
            target: { port: 50000, url: "localhost" }
          });
          const count = new Count(2, () => {
            resolve({ a, b });
          });
          a.onConnect.once(() => {
            count.check();
          });
          b.onConnect.once(() => {
            count.check();
          });
        });
      const { a, b } = await test();
      expect(a.kademlia.di.kTable.getPeer(b.kid)).not.toBe(undefined);
      a.close();
      b.close();
    },
    1000 * 6000
  );

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

      nodes.forEach(node => {
        node.close();
      });
    },
    1000 * 6000
  );
});
