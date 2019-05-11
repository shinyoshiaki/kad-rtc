import findNode from "../findnode";
import sha1 from "sha1";
import { DependencyInjection } from "../../di";
import { OnStore } from "./listen";
import Peer from "../../modules/peer/base";

const Store = (key: string, value: string | ArrayBuffer) => {
  return { rpc: "store" as const, key, value };
};

export type Store = ReturnType<typeof Store>;

export default async function store(
  key: string,
  value: string | ArrayBuffer,
  di: DependencyInjection
) {
  const { kTable } = di;
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
    peer.rpc(Store(key, value));
    await peer
      .eventRpc<OnStore>("OnStore")
      .asPromise(3333)
      .catch(() => {});
  };

  await Promise.all(peers.map(peer => onStore(peer)));

  kvs.set(key, value);
  return key;
}
