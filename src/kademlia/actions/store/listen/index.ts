import { Store } from "..";
import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";

const OnStore = () => {
  return { rpc: "OnStore" as const };
};

export type OnStore = ReturnType<typeof OnStore>;

type actions = Store;

export default function listenStore(peer: Peer, di: DependencyInjection) {
  return new ListenStore(peer, di);
}

class ListenStore {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const onRpc = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "store":
          this.store(data);
          break;
      }
    });
    listen.onDisconnect.once(() => onRpc.unSubscribe());
  }

  store(data: Store) {
    const { key, value } = data;
    const id = (data as any).id;
    const { kvs } = this.di.modules;
    kvs.set(key, value);

    this.listen.rpc({ ...OnStore(), id });
  }
}
