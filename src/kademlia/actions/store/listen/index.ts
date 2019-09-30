import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
import { Peer } from "../../../modules/peer/base";
import { Store } from "..";

class ListenStore {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const { eventManager } = di;
    eventManager.store.subscribe(({ res }) => this.store(res));
  }

  store = (data: Store & ID) => {
    const { kvs } = this.di.modules;
    const { key, value, id, msg } = data;

    kvs.set(key, value, msg as any);

    this.listen.rpc({ ...OnStore(), id });
  };
}

const OnStore = () => {
  return { rpc: "OnStore" as const };
};

export type OnStore = ReturnType<typeof OnStore>;

export default function listenStore(peer: Peer, di: DependencyInjection) {
  return new ListenStore(peer, di);
}
