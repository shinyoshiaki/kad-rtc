import { DependencyInjection } from "../../di";
import { FindValueResult } from "./listen/proxy";
import { listeners } from "../../listeners";

const FindValue = (key: string, except: string[]) => {
  return { rpc: "FindValue" as const, key, except };
};

export type FindValue = ReturnType<typeof FindValue>;

const FindValueAnswer = (sdp: any, peerkid: string) => {
  return { rpc: "FindValueAnswer" as const, sdp, peerkid };
};

export type FindValueAnswer = ReturnType<typeof FindValueAnswer>;

export default async function findValue(key: string, di: DependencyInjection) {
  const { kTable } = di;
  const { peerCreate } = di.modules;

  let result: string | undefined;

  job: for (
    let preHash = "";
    preHash !== kTable.getHash(key);
    preHash = kTable.getHash(key)
  ) {
    for (let peer of kTable.allPeers) {
      const except = kTable.allPeers.map(item => item.kid);
      peer.rpc(FindValue(key, except));

      const res = await peer
        .eventRpc<FindValueResult>("FindValueResult")
        .asPromise(3333)
        .catch(console.error);

      if (!res) {
        continue;
      }

      const { value, offers } = res.data;
      if (value) {
        result = value;
        break job;
      } else if (offers) {
        if (offers.length === 0) continue;

        for (let offer of offers) {
          const { peerkid, sdp } = offer;
          const connect = peerCreate(peerkid);
          const answer = await connect.setOffer(sdp);

          peer.rpc(FindValueAnswer(answer, peerkid));
          await connect.onConnect.asPromise(3333).catch(console.error);

          kTable.add(connect);
          listeners(connect, di);
        }
      }
    }
  }

  return result;
}
