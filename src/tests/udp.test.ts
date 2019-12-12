import {
  PeerUdpMock,
  closeUdpSocket,
  setUpSocket
} from "../kademlia/modules/peer/udp";

import { Count } from "./testtools";
import { Uuid } from "../kademlia";

const PeerModule = (kid: string) => new PeerUdpMock(kid);

describe("mock", () => {
  test(
    "test",
    async () => {
      await setUpSocket();
      await new Promise(async resolve => {
        const count = new Count(2, () => {
          a.disconnect();
          b.disconnect();
          resolve();
        });

        const uuid = new Uuid();

        const a = PeerModule("a");
        const b = PeerModule("b");
        const offer = await a.createOffer();
        const answer = await b.setOffer(offer);
        a.setAnswer(answer);

        a.onConnect.once(async () => {
          const data = { type: "a", msg: "a", id: uuid.get() };
          a.rpc(data);
          a.onRpc.once(v => {
            const { msg } = v as any;
            if (v.type === "b") {
              expect(msg).toBe("b");
              count.check();
            }
          });
        });
        b.onConnect.once(async () => {
          const data = { type: "b", msg: "b", id: uuid.get() };
          b.rpc(data);
          b.onRpc.once(v => {
            const { msg } = v as any;
            if (v.type === "a") {
              expect(msg).toBe("a");
              count.check();
            }
          });
        });
      });
      closeUdpSocket();
    },
    1000 * 6000
  );
});
