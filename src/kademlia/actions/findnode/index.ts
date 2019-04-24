import Peer from "../../modules/peer";
import { FindNodeProxyOffer } from "./listen/proxy";

const FindNode = (finderkid: string, except: string[]) => {
  return { rpc: "findnode" as const, finderkid, except };
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
    const except = peers.map(item => item.kid);
    const rpc = peer.rpc(FindNode(mykid, except));

    const res: actions = await rpc.asPromise();
    if (res.rpc === "FindNodeProxyOffer") {
      const offers = res.peers;
      if (offers.length === 0) continue;

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
