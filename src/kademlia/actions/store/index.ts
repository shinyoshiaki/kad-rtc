import findNode from "../findnode";
import { DependencyInjection } from "../../di";
import Peer from "../../modules/peer/base";
import { timeout } from "../../const";

const Store = (key: string, value: string | ArrayBuffer, msg?: string) => {
  return { rpc: "store" as const, key, value, msg };
};

export type Store = ReturnType<typeof Store>;

export default async function store(
  di: DependencyInjection,
  key: string,
  value: string | ArrayBuffer,
  msg?: string
) {
  const { kTable, rpcManager, jobSystem } = di;
  const { kvs } = di.modules;

  for (
    let preHash = "";
    preHash !== kTable.getHash(key);
    preHash = kTable.getHash(key)
  ) {
    await findNode(key, di);
  }

  const peers = di.kTable.findNode(key);

  const onStore = async (peer: Peer) => {
    const wait = rpcManager.getWait(peer, Store(key, value, msg));
    await wait(timeout).catch(() => {});
  };

  await Promise.all(
    peers.map(async peer => await jobSystem.add(onStore, [peer]))
  );

  kvs.set(key, value);
  return key;
}
