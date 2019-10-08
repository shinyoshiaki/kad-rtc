import { PeerMockModule, PeerModule } from "../kademlia";

import { testSetupNodes } from "./setupnetwork";

describe("setup network", () => {
  test("mock", async () => {
    // 500msでタイムアウト発生
    // 1sでタイムアウト無発生
    const nodes = await testSetupNodes(10, PeerMockModule, {
      kBucketSize: 8,
      timeout: 1_000 / 2
    });
    expect(nodes.length).toBe(10);
  }, 60_000_0);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(10, PeerModule, {
      kBucketSize: 8,
      timeout: 10_000
    });
    expect(nodes.length).toBe(10);
  }, 60_000_0);
});
