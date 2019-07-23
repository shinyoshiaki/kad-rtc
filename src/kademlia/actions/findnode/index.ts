import { FindNodeProxyOffer, Offer } from "./listen/proxy";
import { DependencyInjection } from "../../di";
import { listeners } from "../../listeners";
import Peer from "../../modules/peer/base";
import { timeout } from "../../const";

const FindNode = (searchkid: string, except: string[]) => ({
  rpc: "FindNode" as const,
  searchkid,
  except
});

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: string, peerkid: string) => ({
  rpc: "FindNodeAnswer" as const,
  sdp,
  peerkid
});

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;

export default async function findNode(
  searchkid: string,
  di: DependencyInjection
) {
  const { kTable, rpcManager, signaling } = di;

  if (kTable.getPeer(searchkid)) return kTable.getPeer(searchkid);

  const findNodeProxy = async (peer: Peer) => {
    const except = kTable.allPeers.map(item => item.kid);

    const wait = rpcManager.getWait<FindNodeProxyOffer>(
      peer,
      FindNode(searchkid, except)
    );

    const res = await wait(timeout).catch(() => {});

    if (res) {
      const { peers } = res;
      if (peers.length > 0) return { peers, peer };
    }
    return { peers: [], peer };
  };

  const findNodeAnswer = async (proxy: Peer, offer: Offer) => {
    const { peerkid, sdp } = offer;
    const { peer, candidate } = signaling.create(peerkid);
    if (peer) {
      const answer = await peer.setOffer(JSON.parse(sdp));

      rpcManager.run(proxy, FindNodeAnswer(JSON.stringify(answer), peerkid));
      const res = await peer.onConnect.asPromise(timeout).catch(() => {
        signaling.delete(peerkid);
      });

      if (res) listeners(peer, di);
    } else if (candidate) {
      const peer = await candidate.asPromise(timeout).catch(() => {});
      if (peer) listeners(peer, di);
    }
  };

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchkid).map(peer => findNodeProxy(peer))
  );

  await Promise.all(
    findNodeProxyOfferResult
      .map(item => item.peers.map(offer => findNodeAnswer(item.peer, offer)))
      .flatMap(v => v)
  );

  return kTable.getPeer(searchkid);
}
