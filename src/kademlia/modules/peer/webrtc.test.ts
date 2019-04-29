import { PeerModule } from "./webrtc";
import { Count } from "../../../utill/testtools";

describe("webrtc", () => {
  test(
    "test",
    async () => {
      const test = () =>
        new Promise(async resolve => {
          const count = new Count(2, resolve);

          const a = PeerModule("a");
          const b = PeerModule("b");
          const offer = await a.createOffer();
          const answer = await b.setOffer(offer);
          a.setAnswer(answer);

          a.onConnect.once(async () => {
            const data = { rpc: "a", msg: "a" };
            a.rpc(data);
            const res = await a.eventRpc("b").asPromise();
            expect(res.msg).toBe("b");
            count.check();
          });
          b.onConnect.once(async () => {
            const data = { rpc: "b", msg: "b" };
            b.rpc(data);
            const res = await b.eventRpc("a").asPromise();
            expect(res.msg).toBe("a");
            count.check();
          });
        });
      await test();
    },
    1000 * 6000
  );
});
