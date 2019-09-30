import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import findNode from "../findnode";
import { timeout } from "../../const";

export default async function store(
  di: DependencyInjection,
  key: string,
  value: string | ArrayBuffer,
  msg?: string
) {
  const { kTable, rpcManager, jobSystem } = di;
  const { kvs } = di.modules;

  kvs.set(key, value, msg as any);

  for (
    let preHash = "";
    preHash !== kTable.getHash(key);
    preHash = kTable.getHash(key)
  ) {
    await findNode(key, di);
  }

  const peers = di.kTable.findNode(key);

  const item = Store(key, value, msg);

  const onStore = async (peer: Peer) => {
    const wait = rpcManager.getWait(peer, item);
    await wait(timeout).catch(() => {});
    // TODO error handling
  };

  await Promise.all(
    peers.map(async peer => await jobSystem.add(onStore, [peer]))
  );

  return item;
}

const Store = (key: string, value: string | ArrayBuffer, msg?: string) => ({
  type: "Store" as const,
  key,
  value,
  msg
});

export type Store = ReturnType<typeof Store>;
