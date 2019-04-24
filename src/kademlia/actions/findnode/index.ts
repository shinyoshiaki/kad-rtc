import Peer from "../../modules/peer";
import { FindNodeProxyOffer } from "./listen/proxy";

const FindNode = (finderkid: string) => {
  return { rpc: "findnode" as const, finderkid };
};

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: string, peerkid: string) => {
  return { rpc: "findnodeanswer" as const, sdp, peerkid };
};

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

type actions = FindNodeProxyOffer;

export default async function findNode(
  module: (kid: string) => Peer,
  mykid: string,
  peers: Peer[]
) {
  const finds: Peer[] = [];
  for (let peer of peers) {
    const rpc = peer.rpc(FindNode(mykid));

    const res: actions = await rpc.asPromise();
    if (res.rpc === "FindNodeProxyOffer") {
      const offers = res.peers;

      for (let offer of offers) {
        const { peerkid, sdp } = offer;
        const connect = module(peerkid);
        const answer = await connect.setOffer(sdp);

        peer.rpc(FindNodeAnswer(answer, peerkid));
        await connect.onConnect.asPromise();

        finds.push(connect);
      }
    }
  }
  return finds;
}
