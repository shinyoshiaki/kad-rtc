import { DependencyInjection } from "../../di";
import { ListenStore } from "./listen";
import { Peer } from "../../modules/peer/base";
import { findNode } from "../findnode";
import { wrap } from "../../../vendor/airpc/main";
import { wrapper } from "../rpc";

export default async function store(
  di: DependencyInjection,
  key: string,
  value: string | ArrayBuffer,
  msg?: string
) {
  const { kTable, rpcManager, jobSystem } = di;
  const { timeout } = di.opt;
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
    const actions = wrap(ListenStore, wrapper(peer));
    await actions.store(key, value, msg);
  };

  await Promise.all(
    peers.map(async peer => await jobSystem.add(onStore, [peer]))
  );

  return { item, peers };
}

const Store = (key: string, value: string | ArrayBuffer, msg?: string) => ({
  type: "Store" as const,
  key,
  value,
  msg
});

export type Store = ReturnType<typeof Store>;
