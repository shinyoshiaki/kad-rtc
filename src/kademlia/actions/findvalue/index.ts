import { DependencyInjection } from "../../di";

const FindValue = (key: string, except: string[]) => {
  return { rpc: "FindValue" as const, key, except };
};

export type FindValue = ReturnType<typeof FindValue>;

export default async function findValue(key: string, di: DependencyInjection) {
  const { kTable } = di;

  for (let _ in [...Array(kTable.kBucketSize)]) {
    for (let peer of kTable.allPeers) {
      const except = kTable.allPeers.map(item => item.kid);
      peer.rpc(FindValue(key, except));

      const res = await peer.eventRpc("").asPromise();
    }
  }
}
