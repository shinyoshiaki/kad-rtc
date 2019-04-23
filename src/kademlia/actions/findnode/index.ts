import Peer from "../../modules/peer";
import { OnFindNode } from "./rpc";

const FindNode = (kid: string) => {
  return { rpc: "findnode" as const, kid };
};

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: string, kid: string) => {
  return { rpc: "findnodeanswer" as const, sdp, kid };
};

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

type rpcs = OnFindNode;

export default async function findNode(kid: string, peers: Peer[]) {
  const finds: Peer[] = [];
  for (let peer of peers) {
    const rpc = peer.rpc(FindNode(kid));
    const res: rpcs = await rpc.asPromise();
    if (res.rpc === "onfindnode") {
      const offers = res.peers;

      for (let offer of offers) {
        const { kid, sdp } = offer;
        const peer = new Peer(kid);
        peer.setSdp(sdp);
        const answer = await peer.onSignal.asPromise();
        peer.rpc(FindNodeAnswer(answer, kid));
        await peer.onConnect.asPromise();
        finds.push(peer);
      }
    }
  }
  return finds;
}
