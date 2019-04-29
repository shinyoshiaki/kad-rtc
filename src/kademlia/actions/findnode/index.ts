import { FindNodeProxyOffer } from "./listen/proxy";
import { DependencyInjection } from "../../di";
import { listeners } from "../../listeners";

const FindNode = (searchkid: string, except: string[]) => {
  return { rpc: "FindNode" as const, searchkid, except };
};

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: any, peerkid: string) => {
  return { rpc: "FindNodeAnswer" as const, sdp, peerkid };
};

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

export default async function findNode(
  searchkid: string,
  di: DependencyInjection
) {
  const { kTable } = di;
  const { peerCreate } = di.modules;

  if (kTable.getPeer(searchkid)) return kTable.getPeer(searchkid);

  for (let peer of kTable.allPeers) {
    const except = kTable.allPeers.map(item => item.kid);
    peer.rpc(FindNode(searchkid, except));

    const res = await peer
      .eventRpc<FindNodeProxyOffer>("FindNodeProxyOffer")
      .asPromise();

    const { peers } = res;
    if (peers.length === 0) continue;

    for (let offer of peers) {
      const { peerkid, sdp } = offer;
      const connect = peerCreate(peerkid);
      const answer = await connect.setOffer(sdp);

      peer.rpc(FindNodeAnswer(answer, peerkid));
      await connect.onConnect.asPromise();

      kTable.add(connect);
      listeners(connect, di);
    }
  }
  return kTable.getPeer(searchkid);
}
