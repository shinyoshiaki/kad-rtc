import { PeerMockModule } from "../kademlia";
import { testSetupNodes } from "./setupnetwork";

describe("setup network", () => {
  test("mock", async () => {
    // timeout at least 100
    const nodes = await testSetupNodes(20, PeerMockModule, {
      kBucketSize: 8,
      timeout: 200
    });
    expect(nodes.length).toBe(20);
  }, 60_000_0);
});
