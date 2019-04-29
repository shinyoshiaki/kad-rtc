import Portal from ".";
import { Count } from "../../utill/testtools";

const kBucketSize = 5;
const num = kBucketSize * 2;

async function testSetupNodes(kBucketSize: number, num: number) {
  const nodes: Portal[] = [];
  const first = new Portal({ port: 20000 });
  nodes.push(first);

  for (let i = 1; i < num; i++) {
    const node = new Portal({
      target: { url: "localhost", port: 20000 + i - 1 },
      port: 20000 + i,
      kadOption: { kBucketSize }
    });
    await node.onConnect.asPromise();
    nodes.push(node);
  }
  return nodes;
}

describe("portal", () => {
  test(
    "p2p",
    async () => {
      const test = () =>
        new Promise<{ a: Portal; b: Portal }>(resolve => {
          const a = new Portal({ port: 10000 });
          const b = new Portal({
            port: 10001,
            target: { port: 10000, url: "localhost" }
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

  // test(
  //   "findnode",
  //   async () => {
  //     const nodes = await testSetupNodes(kBucketSize, num);

  //     const last = nodes.slice(-1)[0];

  //     expect(true).toBe(true);

  //     nodes.forEach(node => {
  //       node.close();
  //     });
  //   },
  //   1000 * 6000
  // );
});
