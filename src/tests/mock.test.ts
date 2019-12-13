import { PeerMock, Uuid } from "../kademlia";

import { Count } from "./testtools";

const PeerModule = (kid: string) => new PeerMock(kid);

describe("mock", () => {
  test(
    "test",
    async () => {
      await new Promise(async resolve => {
        const count = new Count(2, () => {
          a.disconnect();
          b.disconnect();
          resolve();
        });

        const uuid = new Uuid();

        const a = PeerModule("a");
        const b = PeerModule("b");

        a.onConnect.once(async () => {
          a.onRpc.once(v => {
            const { msg } = v as any;
            if (v.type === "b") {
              expect(msg).toBe("b");
              count.check();
            }
          });
          a.rpc({ type: "a", msg: "a", id: uuid.get() });
        });
        b.onConnect.once(async () => {
          b.onRpc.once(v => {
            const { msg } = v as any;
            if (v.type === "a") {
              expect(msg).toBe("a");
              count.check();
            }
          });
          b.rpc({ type: "b", msg: "b", id: uuid.get() });
        });

        const offer = await a.createOffer();
        const answer = await b.setOffer(offer);
        a.setAnswer(answer);
      });
    },
    1000 * 6000
  );
});
