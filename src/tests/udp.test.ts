import {
  PeerUdpModule,
  closeUdpSocket,
  setUpSocket
} from "../kademlia/modules/peer/udp";

import { testPeerModule } from "./testPeerModule";

describe("udp", () => {
  test(
    "test",
    async () => {
      await setUpSocket();
      const a = PeerUdpModule("a");
      const b = PeerUdpModule("b");

      await testPeerModule(a, b);
      await closeUdpSocket();
    },
    1000 * 6000
  );
});
