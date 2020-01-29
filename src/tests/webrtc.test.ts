import { PeerModule } from "../kademlia";
import { testPeerModule } from "./testPeerModule";

describe("webrtc", () => {
  test("test", async () => {
    const a = PeerModule("a");
    const b = PeerModule("b");
    testPeerModule(a, b);
  }, 10_000);
});
