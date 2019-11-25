import { PeerMockModule, PeerModule } from "../kademlia";

import { testSetupNodes } from "./setupnetwork";

describe("setup network", () => {
  test(
    "mock",
    async () => {
      const nodes = await testSetupNodes(10, PeerMockModule, {
        kBucketSize: 8,
        timeout: 60_000 * 10
      });
      expect(nodes.length).toBe(10);
    },
    60_000 * 5
  );

  test(
    "webrtc",
    async () => {
      const nodes = await testSetupNodes(10, PeerModule, {
        kBucketSize: 8,
        timeout: 60_000 * 10
      });
      expect(nodes.length).toBe(10);
    },
    60_000 * 5
  );
});
