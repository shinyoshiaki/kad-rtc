import { Count } from "./testtools";
import { Peer } from "../kademlia";

export const testPeerModule = (a: Peer, b: Peer) =>
  new Promise(async resolve => {
    const count = new Count(2, () => {
      a.disconnect();
      b.disconnect();
      resolve();
    });

    a.onConnect.once(async () => {
      a.onRpc.once(v => {
        if (v.type === "b") {
          expect(v.value.toString()).toBe("b");
          count.check();
        }
      });
      a.rpc({ type: "a", value: Buffer.from("a") });
    });
    b.onConnect.once(async () => {
      b.onRpc.once(v => {
        if (v.type === "a") {
          expect(v.value.toString()).toBe("a");
          count.check();
        }
      });
      b.rpc({ type: "b", value: Buffer.from("b") });
    });

    const offer = await a.createOffer();
    const answer = await b.setOffer(offer);
    a.setAnswer(answer);
  });
