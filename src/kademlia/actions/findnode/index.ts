import {
  FindNodeProxyAnswerError,
  FindNodeProxyOffer,
  OfferPayload
} from "./listen/node";

import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
import { listeners } from "../../listeners";

export default async function findNode(
  searchKid: string,
  di: DependencyInjection
) {
  const connected: Peer[] = [];
  const { kTable, rpcManager, signaling } = di;
  const { timeout } = di.opt;

  if (kTable.getPeer(searchKid)) return [kTable.getPeer(searchKid)!];

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchKid).map(async peer => {
      const except = kTable.allPeers.map(item => item.kid);

      const res = await rpcManager
        .getWait<FindNodeProxyOffer>(
          peer,
          FindNode(searchKid, except)
        )(timeout)
        .catch(() => {});

      if (res) {
        const { peers } = res;
        if (peers.length > 0) return { peers, peer };
      } else {
        console.log("timeout", "FindNode", timeout, peer.type);
      }

      return { peers: [], peer };
    })
  );

  const _findNodeAnswer = async (node: Peer, offer: OfferPayload) => {
    const { peerKid, sdp } = offer;
    const { peer, candidate } = signaling.create(peerKid);
    const __createAnswer = async (peer: Peer) => {
      const answer = await peer.setOffer(sdp);

      rpcManager
        .asObservable<FindNodeProxyAnswerError>(
          "FindNodeProxyAnswerError",
          node
        )
        .once(() => {
          peer.onConnect.error("FindNodeProxyAnswerError");
        });

      rpcManager.run(node, FindNodeAnswer(answer, peerKid));

      const err = await peer.onConnect.asPromise(timeout).catch(() => {
        return "err";
      });
      if (err) {
        signaling.delete(peerKid);
      } else {
        listeners(peer, di);
        connected.push(peer);
      }
    };
    if (peer) {
      await __createAnswer(peer);
    } else if (candidate) {
      const { peer, event } = candidate;
      // node.ts側でタイミング悪くPeerを作ってしまった場合の処理
      // (並行テスト時にしか起きないと思う)
      if (peer.SdpType === "offer") {
        await __createAnswer(peer);
      } else {
        await event.asPromise(timeout).catch(() => {});
      }
    }
    // 相手側のlistenが完了するまで待つ
    // TODO : ちゃんと実装する
    await new Promise(r => setTimeout(r, 100));
  };

  await Promise.all(
    findNodeProxyOfferResult
      .map(item => item.peers.map(offer => _findNodeAnswer(item.peer, offer)))
      .flatMap(v => v)
  );

  return connected;
}

const FindNode = (searchKid: string, except: string[]) => ({
  type: "FindNode" as const,
  searchKid,
  except
});

export type FindNode = ReturnType<typeof FindNode>;

const FindNodeAnswer = (sdp: Signal, peerKid: string) => ({
  type: "FindNodeAnswer" as const,
  sdp,
  peerKid
});

export type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
