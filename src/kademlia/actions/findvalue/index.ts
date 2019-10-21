import { FindValueResult, Offer } from "./listen/node";

import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
import { listeners } from "../../listeners";

export default async function findValue(
  key: string,
  di: DependencyInjection,
  opt?: { preferTimeout?: number }
): Promise<{ item: Item; peer: Peer } | undefined> {
  const { kTable, rpcManager, signaling } = di;
  let { timeout } = di.opt;
  if (opt && opt.preferTimeout) timeout = opt.preferTimeout;

  let result: { item: Item; peer: Peer } | undefined;

  const job = async () => {
    const findValueResultResult = await Promise.all(
      kTable.allPeers.map(async proxy => {
        const except = kTable.findNode(key).map(({ kid }) => kid);

        const wait = rpcManager.getWait<FindValueResult>(
          proxy,
          FindValue(key, except)
        );
        const res = await wait(timeout).catch(() => {
          return undefined;
        });

        if (res) {
          const { item, offers } = res.data;

          if (item && !result) {
            result = { item, peer: proxy };
            return { offers: [], proxy };
          } else if (offers) {
            if (offers.length > 0) {
              return { offers, proxy };
            }
          }
        }

        return { offers: [], proxy };
      })
    );

    if (result) return;

    const findValueAnswer = async (offer: Offer, proxy: Peer) => {
      const { peerkid, sdp } = offer;
      const { peer, candidate } = signaling.create(peerkid);

      if (peer) {
        const answer = await peer.setOffer(sdp);

        rpcManager.run(proxy, FindValueAnswer(answer, peerkid));

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
          return undefined;
        });
        if (peer) listeners(peer, di);
      }
      // 相手側のlistenが完了するまで待つ
      // TODO : ちゃんと実装する
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

const FindValue = (key: string, except: string[]) => ({
  type: "FindValue" as const,
  key,
  except
});

export type FindValue = ReturnType<typeof FindValue>;

const FindValueAnswer = (sdp: Signal, peerkid: string) => ({
  type: "FindValueAnswer" as const,
  sdp,
  peerkid
});

export type FindValueAnswer = ReturnType<typeof FindValueAnswer>;
