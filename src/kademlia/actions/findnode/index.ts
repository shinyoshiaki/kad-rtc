import Peer from "../../modules/peer";
import { FindNodeProxyOffer } from "./listen/proxy";
import Ktable from "../../ktable";
import listenFindnode from "./listen";

const FindNode = (searchkid: string, except: string[]) => {
  return { rpc: "findnode" as const, searchkid, except };
};

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: string, peerkid: string) => {
  return { rpc: "findnodeanswer" as const, sdp, peerkid };
};

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

export default async function findNode(
  module: (kid: string) => Peer,
  searchkid: string,
  ktable: Ktable
) {
  for (let peer of ktable.findNode(searchkid)) {
    const except = ktable.allPeers.map(item => item.kid);
    peer.rpc(FindNode(searchkid, except));

    const res: FindNodeProxyOffer = await peer
      .eventRpc("FindNodeProxyOffer")
      .asPromise();

    const { peers } = res;
    if (peers.length === 0) continue;

    for (let offer of peers) {
      const { peerkid, sdp } = offer;
      const connect = module(peerkid);
      const answer = await connect.setOffer(sdp);

      peer.rpc(FindNodeAnswer(answer, peerkid));
      await connect.onConnect.asPromise();

      ktable.add(connect);
      listenFindnode(module, connect, ktable);
    }
  }
  return ktable.getPeer(searchkid);
}
