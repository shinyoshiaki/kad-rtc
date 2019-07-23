import { Store } from "..";
import { Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";

export default function listenStore(peer: Peer, di: DependencyInjection) {
  return new ListenStore(peer, di);
}

class ListenStore {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;
    rpcManager.asObservable<Store>("Store", listen).subscribe(this.store);
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
