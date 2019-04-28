import { FindNodeProxyOffer } from "./listen/proxy";
import sha1 from "sha1";
import { DependencyInjection } from "../../di";
import { listeners } from '../../listeners';

const FindNode = (searchkid: string, except: string[]) => {
  return { rpc: "findnode" as const, searchkid, except };
};

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: string, peerkid: string) => {
  return { rpc: "findnodeanswer" as const, sdp, peerkid };
};

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

export default async function findNode(
  searchkid: string,
  di: DependencyInjection
) {
  const { kTable, peerModule } = di;
  for (let peer of kTable.allPeers) {
    const except = kTable.allPeers.map(item => item.kid);
    peer.rpc(FindNode(searchkid, except));

    const res: FindNodeProxyOffer = await peer
      .eventRpc("FindNodeProxyOffer")
      .asPromise();

    const { peers } = res;
    if (peers.length === 0) continue;

    for (let offer of peers) {
      const { peerkid, sdp } = offer;
      const connect = peerModule(peerkid);
      const answer = await connect.setOffer(sdp);

      peer.rpc(FindNodeAnswer(answer, peerkid));
      await connect.onConnect.asPromise();

      kTable.add(connect);
      listeners(connect, di);
    }
  }
  return {
    target: kTable.getPeer(searchkid),
    hash: sha1(
      JSON.stringify(
        kTable
          .findNode(searchkid)
          .map(v => v.kid)
          .sort()
      )
    ).toString()
  };
}
