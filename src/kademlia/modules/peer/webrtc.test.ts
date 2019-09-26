import { PeerModule } from "./webrtc";
import { Count } from "../../../utill/testtools";
import Uuid from "../../../utill/uuid";

describe("webrtc", () => {
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
            const data = { rpc: "a", msg: "a", id: uuid.get() };
            a.rpc(data);
            a.onRpc.once(v => {
              if (v.rpc === "b") {
                expect(v.msg).toBe("b");
                count.check();
              }
            });
          });
          b.onConnect.once(async () => {
            const data = { rpc: "b", msg: "b", id: uuid.get() };
            b.rpc(data);
            b.onRpc.once(v => {
              if (v.rpc === "a") {
                expect(v.msg).toBe("a");
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
