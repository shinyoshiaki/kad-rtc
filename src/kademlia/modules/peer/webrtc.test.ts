import { PeerModule } from "./webrtc";

describe("webrtc", () => {
  test(
    "test",
    async () => {
      const test = () =>
        new Promise(async resolve => {
          let count = 0;
          const end = () => {
            count++;
            if (count === 2) resolve();
          };

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
            end();
          });
          b.onConnect.once(async () => {
            const data = { rpc: "b", msg: "b" };
            b.rpc(data);
            const res = await b.eventRpc("a").asPromise();
            expect(res.msg).toBe("a");
            end();
          });
        });
      await test();
    },
    1000 * 6000
  );
});
