import {
  FindNodeProxyAnswerError,
  FindNodeProxyOffer,
  Offer
} from "./listen/node";

import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
import { listeners } from "../../listeners";

export default async function findNode(
  searchkid: string,
  di: DependencyInjection
) {
  const { kTable, rpcManager, signaling } = di;
  const { timeout } = di.opt;

  if (kTable.getPeer(searchkid)) return kTable.getPeer(searchkid);

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchkid).map(async peer => {
      const except = kTable.allPeers.map(item => item.kid);

      const wait = rpcManager.getWait<FindNodeProxyOffer>(
        peer,
        FindNode(searchkid, except)
      );

      const res = await wait(timeout).catch(() => {
        return false as const;
      });

      if (res) {
        const { peers } = res;
        if (peers.length > 0) return { peers, peer };
      }
      return { peers: [], peer };
    })
  );

  const findNodeAnswer = async (proxy: Peer, offer: Offer) => {
    const { peerkid, sdp } = offer;
    const { peer, candidate } = signaling.create(peerkid);
    if (peer) {
      const answer = await peer.setOffer(sdp);

      rpcManager
        .asObservable<FindNodeProxyAnswerError>(
          "FindNodeProxyAnswerError",
          proxy
        )
        .once(() => {
          peer.onConnect.error("FindNodeProxyAnswerError");
        });

      rpcManager.run(proxy, FindNodeAnswer(answer, peerkid));
      const err = await peer.onConnect.asPromise(timeout).catch(() => {
        return "err";
      });
      if (err) {
        signaling.delete(peerkid);
      } else {
        listeners(peer, di);
      }
    } else if (candidate) {
      const peer = await candidate.asPromise(timeout).catch(() => {
        return false as const;
      });
      if (peer) listeners(peer, di);
    }
  };

  await Promise.all(
    findNodeProxyOfferResult
      .map(item => item.peers.map(offer => findNodeAnswer(item.peer, offer)))
      .flatMap(v => v)
  );

  return kTable.getPeer(searchkid);
}

const FindNode = (searchkid: string, except: string[]) => ({
  type: "FindNode" as const,
  searchkid,
  except
});

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: Signal, peerkid: string) => ({
  type: "FindNodeAnswer" as const,
  sdp,
  peerkid
});

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
