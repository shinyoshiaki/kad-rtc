import { DependencyInjection } from "../../di";
import { FindNodeProxy } from "./listen/node";
import { Peer } from "../../modules/peer/base";
import { listeners } from "../../listeners";
import { wrap } from "../../../vendor/airpc/main";
import { wrapper } from "../rpc";

/**
 * if searchKid exist return peer
 * @param searchKid
 * @param di
 */

export async function findNode(
  searchKid: string,
  di: DependencyInjection
): Promise<Peer | undefined> {
  const { kTable, signaling } = di;
  const { timeout } = di.opt;

  if (kTable.getPeer(searchKid)) return kTable.getPeer(searchKid)!;

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchKid).map(async peer => {
      const actions = wrap(FindNodeProxy, wrapper(peer), timeout);

      const except = kTable.allPeers.map(item => item.kid);

      const data = await actions.findnode(searchKid, except).catch(() => {});
      if (data) {
        if (data.length > 0) return { peers: data, peer };
      }

      return { peers: [], peer };
    })
  );

  // signaling
  await Promise.all(
    findNodeProxyOfferResult
      .map(({ peer: node, peers }) =>
        peers.map(async offer => {
          const actions = wrap(FindNodeProxy, wrapper(node), timeout);

          const { peerKid, sdp } = offer;
          const { peer, candidate } = signaling.create(peerKid);

          const _createAnswer = async (peer: Peer) => {
            const answer = await peer.setOffer(JSON.parse(sdp));

            actions.findNodeAnswer(JSON.stringify(answer), peerKid);

            const err = await peer.onConnect.asPromise(timeout).catch(() => {
              return "err";
            });
            if (err) {
              signaling.delete(peerKid);
            } else {
              listeners(peer, di);
            }
          };

          if (peer) {
            await _createAnswer(peer);
          } else if (candidate) {
            const { peer, event } = candidate;
            if (peer.SdpType === "offer") {
              await _createAnswer(peer);
            } else {
              await event.asPromise(timeout).catch(() => {});
            }
          }

          await new Promise(r => setTimeout(r, 100));
        })
      )
      .flatMap(v => v)
  );
}
