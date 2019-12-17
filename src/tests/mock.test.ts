import { PeerMock } from "../kademlia";
import { testPeerModule } from "./testPeerModule";

const PeerModule = (kid: string) => new PeerMock(kid);

describe("mock", () => {
  test(
    "test",
    async () => {
      const a = PeerModule("a");
      const b = PeerModule("b");
      await testPeerModule(a, b);
    },
    1000 * 6000
  );
});
