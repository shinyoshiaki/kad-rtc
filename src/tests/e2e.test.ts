import { PeerMockModule, PeerModule } from "../kademlia";

import Kademlia from "..";
import { testSetupNodes } from "./setupnetwork";

describe("e2e", () => {
  const job = async (nodes: Kademlia[]) => {
    const kadStore = nodes.pop()!;

    const { item } = await kadStore.store("test");

    await new Promise(r => setTimeout(r));

    await Promise.all(
      nodes.map(async node => {
        const res = await node.findValue(item.key);

        expect(res).not.toBeUndefined();
        {
          const { item } = res!;
          expect(item.value).toEqual("test");
        }
      })
    );
    expect(true).toBe(true);
  };

  test("mock", async () => {
    const nodes = await testSetupNodes(10, PeerMockModule, { timeout: 60_000 });
    await job(nodes);
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(10, PeerModule, { timeout: 60_000 });
    await job(nodes);
  }, 600_000);
});
