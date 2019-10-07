import { PeerMock, Uuid } from "../kademlia";

import { Count } from "./testtools";

const PeerModule = (kid: string) => new PeerMock(kid);

describe("mock", () => {
  test(
    "test",
    async () => {
      const test = () =>
        new Promise(async resolve => {
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
      await test();
    },
    1000 * 6000
  );
});
