import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import { TestFindNodeProxy } from "./listen/node";
import { listeners } from "../../listeners";
import { wrap } from "../../../vendor/airpc/main";
import { wrapper } from "../rpc";

export async function findNode(searchKid: string, di: DependencyInjection) {
  const connected: Peer[] = [];
  const { kTable, signaling } = di;
  const { timeout } = di.opt;

  if (kTable.getPeer(searchKid)) return [kTable.getPeer(searchKid)!];

  const findNodeProxyOfferResult = await Promise.all(
    kTable.findNode(searchKid).map(async peer => {
      const node = wrap(TestFindNodeProxy, wrapper(peer));

      const except = kTable.allPeers.map(item => item.kid);

      const peers = await node.findnode(searchKid, except);

      if (peers.length > 0) return { peers, peer };
      return { peers: [], peer };
    })
  );

  await Promise.all(
    findNodeProxyOfferResult
      .map(({ peer: node, peers }) =>
        peers.map(async offer => {
          const findNodeProxy = wrap(TestFindNodeProxy, wrapper(node));

          const { peerKid, sdp } = offer;
          const { peer, candidate } = signaling.create(peerKid);

          const _createAnswer = async (peer: Peer) => {
            const answer = await peer.setOffer(JSON.parse(sdp));

            findNodeProxy.findNodeAnswer(JSON.stringify(answer), peerKid);

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
