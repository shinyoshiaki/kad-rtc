import { DependencyInjection } from "../../di";
import { FindValueResult, Offer } from "./listen/proxy";
import { listeners } from "../../listeners";
import Peer from "../../modules/peer/base";
import { timeout } from "../../const";

const FindValue = (key: string, except: string[]) => {
  return { rpc: "FindValue" as const, key, except };
};

export type FindValue = ReturnType<typeof FindValue>;

const FindValueAnswer = (sdp: any, peerkid: string) => {
  return { rpc: "FindValueAnswer" as const, sdp, peerkid };
};

export type FindValueAnswer = ReturnType<typeof FindValueAnswer>;

export default async function findValue(key: string, di: DependencyInjection) {
  const { kTable, jobs } = di;
  const { peerCreate } = di.modules;

  let result: string | ArrayBuffer | undefined | Buffer;

  const findValueAnswer = async (offer: Offer, peer: Peer) => {
    const { peerkid, sdp } = offer;
    const connect = peerCreate(peerkid);
    const answer = await connect.setOffer(sdp);

    peer.rpc(FindValueAnswer(answer, peerkid));
    const res = await connect.onConnect.asPromise(timeout).catch(() => {});
    if (res) {
      kTable.add(connect);
      listeners(connect, di);
    }
  };

  const findValueResult = async (peer: Peer) => {
    const except = kTable.allPeers.map(item => item.kid);
    peer.rpc(FindValue(key, except));

    const res = await peer
      .eventRpc<FindValueResult>("FindValueResult")
      .asPromise(timeout)
      .catch(() => {});

    if (res) {
      const { value, offers } = res.data;

      if (value) {
        result = value;
      } else if (offers) {
        if (offers.length > 0) {
          return { offers, peer };
        }
      }
    }
    return { offers: [], peer };
  };

  const job = async () => {
    const findValueResultResult = await Promise.all(
      kTable.allPeers.map(async peer => {
        const res = await jobs.add(findValueResult, [peer]);
        return res;
      })
    );
    await Promise.all(
      findValueResultResult
        .map(item =>
          item.offers.map(async offer => {
            await jobs.add(findValueAnswer, [offer, item.peer]);
          })
        )
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
