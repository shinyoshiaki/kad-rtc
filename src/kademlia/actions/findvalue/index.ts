import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
import { Peer } from "../../modules/peer/base";
import { TestFindValueProxy } from "./listen/node";
import { listeners } from "../../listeners";
import { wrap } from "../../../vendor/airpc/main";
import { wrapper } from "../rpc";

export default async function findValue(
  key: string,
  di: DependencyInjection,
  opt?: { preferTimeout?: number }
): Promise<{ item: Item; peer: Peer } | undefined> {
  const { kTable, signaling } = di;
  let { timeout } = di.opt;
  if (opt && opt.preferTimeout) timeout = opt.preferTimeout;

  let result: { item: Item; peer: Peer } | undefined;

  const job = async () => {
    const findValueResultResult = await Promise.all(
      kTable.findNode(key).map(async proxy => {
        const except = kTable.findNode(key).map(({ kid }) => kid);
        const actions = wrap(TestFindValueProxy, wrapper(proxy));

        const res = await actions.findvalue(key, except);

        if (res) {
          const { item, offers } = res;

          if (item && !result) {
            result = { item, peer: proxy };
            return { offers: [], proxy };
          } else if (offers) {
            if (offers.length > 0) {
              return { offers, proxy };
            }
          }
        } else {
          console.log("timeout", "FindValue", proxy.type, timeout);
        }

        return { offers: [], proxy };
      })
    );

    if (result) return;

    const findValueAnswer = async (
      offer: { peerKid: string; sdp: string },
      proxy: Peer
    ) => {
      const { peerKid, sdp } = offer;
      const { peer, candidate } = signaling.create(peerKid);

      const actions = wrap(TestFindValueProxy, wrapper(proxy));

      const _createAnswer = async (peer: Peer) => {
        const answer = await peer.setOffer(JSON.parse(sdp));

        actions.findValueAnswer(JSON.stringify(answer), peerKid);

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
    };

    await Promise.all(
      findValueResultResult
        .map(v => v.offers.map(offer => findValueAnswer(offer, v.proxy)))
        .flatMap(v => v)
    );
  };

  for (
    let preHash = "";
    preHash !== kTable.getHash(key);
    preHash = kTable.getHash(key)
  ) {
    await job();
    if (result) break;
  }

  return result;
}
