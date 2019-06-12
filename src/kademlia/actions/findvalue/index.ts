import { DependencyInjection } from "../../di";
import { FindValueResult, Offer } from "./listen/proxy";
import { listeners } from "../../listeners";
import Peer from "../../modules/peer/base";
import { timeout } from "../../const";
import { Item } from "../../modules/kvs/base";

const FindValue = (key: string, except: string[]) => {
  return { rpc: "FindValue" as const, key, except };
};

export type FindValue = ReturnType<typeof FindValue>;

const FindValueAnswer = (sdp: any, peerkid: string) => {
  return { rpc: "FindValueAnswer" as const, sdp, peerkid };
};

export type FindValueAnswer = ReturnType<typeof FindValueAnswer>;

export default async function findValue(key: string, di: DependencyInjection) {
  const { kTable, rpcManager, signaling, modules } = di;
  const { kvs } = modules;

  let result: Item | undefined;

  const findValueProxy = async (proxy: Peer) => {
    const except = kTable.allPeers.map(item => item.kid);

    const wait = rpcManager.getWait<FindValueResult>(
      proxy,
      FindValue(key, except)
    );
    const res = await wait(timeout).catch(e => {
      console.warn(e);
    });

    if (res) {
      const { item, offers } = res.data;

      if (item && !result) {
        result = item;
        return { offers: [], proxy };
      } else if (offers) {
        if (offers.length > 0) {
          return { offers, proxy };
        }
      }
    } else {
      kTable.rmPeer(proxy.kid);
    }

    return { offers: [], proxy };
  };

  const findValueAnswer = async (offer: Offer, proxy: Peer) => {
    const { peerkid, sdp } = offer;

    const { peer, candidate } = signaling.create(peerkid);

    if (peer) {
      const answer = await peer.setOffer(sdp);

      rpcManager.run(proxy, FindValueAnswer(answer, peerkid));

      const res = await peer.onConnect.asPromise(timeout).catch(() => {
        signaling.delete(peerkid);
      });
      if (res) listeners(peer, di);
    } else if (candidate) {
      const peer = await candidate.asPromise(timeout).catch(() => {});
      if (peer) listeners(peer, di);
    }
  };

  const job = async () => {
    const findValueResultResult = await Promise.all(
      kTable.allPeers.map(peer => findValueProxy(peer))
    );
    if (!result) {
      await Promise.all(
        findValueResultResult
          .map(v => v.offers.map(offer => findValueAnswer(offer, v.proxy)))
          .flatMap(v => v)
      );
    }
  };

  if (kvs.get(key)) return kvs.get(key);

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
