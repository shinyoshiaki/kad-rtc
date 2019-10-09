import { PeerMockModule, PeerModule } from "../kademlia";

import { testSetupNodes } from "./setupnetwork";

describe("setup network", () => {
  test("mock", async () => {
    // 500msでタイムアウト発生
    // 1sでタイムアウト無発生
    const nodes = await testSetupNodes(10, PeerMockModule, { timeout: 1_000 });
    expect(nodes.length).toBe(10);
  }, 600_000);

  test("webrtc", async () => {
    const nodes = await testSetupNodes(10, PeerModule, { timeout: 1_000 });
    expect(nodes.length).toBe(10);
  }, 600_000);
});
