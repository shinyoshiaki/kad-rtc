import { PeerModule } from "./mock";

describe("mock", () => {
  test("test", async () => {
    const a = PeerModule("a");
    const b = PeerModule("b");
    const offer = await a.createOffer();
    const answer = await b.setOffer(offer);
    await a.setAnswer(answer);

    a.onConnect.once(() => {
      const rpc= a.rpc({ rpc: "testa" });

    });
    b.onConnect.once(() => {
      b.rpc({ rpc: "testa" });
    });
  });
});
