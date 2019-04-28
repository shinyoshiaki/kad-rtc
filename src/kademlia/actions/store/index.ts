import findNode from "../findnode";
import sha1 from "sha1";
import { DependencyInjection } from "../../di";
import { OnStore } from "./listen";

const Store = (key: string, value: string) => {
  return { rpc: "store" as const, key, value };
};

export type Store = ReturnType<typeof Store>;

export default async function store(value: string, di: DependencyInjection) {
  const key = sha1(value).toString();
  for (let pre = "", i = 0; i < 100; i++) {
    const res = await findNode(key, di);
    if (pre === res.hash) {
      break;
    }
  }
  const peers = di.kTable.findNode(key);
  for (let peer of peers) {
    peer.rpc(Store(key, value));
    await peer.eventRpc<OnStore>("OnStore").asPromise();
  }
  di.kvs.set(key, value);
}
