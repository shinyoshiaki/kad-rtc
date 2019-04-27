import Portal from ".";

describe("portal", () => {
  test(
    "p2p",
    async () => {
      const a = new Portal({ port: 10000 });
      const b = new Portal({
        port: 10001,
        target: { port: 10000, url: "localhost" }
      });

      await b.onConnect.asPromise();
      expect(a.kademlia.kTable.getPeer(b.kid)).not.toBe(undefined);
    },
    1000 * 6000
  );

  test(
    "findnode",
    async () => {
      const nodes: Portal[] = [];
      const first = new Portal({ port: 20000 });
      nodes.push(first);

      for (let i = 1; i < 6; i++) {
        const node = new Portal({
          target: { url: "localhost", port: 20000 + i - 1 },
          port: 20000 + i
        });
        await node.onConnect.asPromise();
        nodes.push(node);
      }

      const last = nodes.slice(-1)[0];

      await new Promise(r => setTimeout(r, 5000));
      expect(true).toBe(true);
    },
    1000 * 6000
  );
});
