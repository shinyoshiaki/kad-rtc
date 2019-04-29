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
    const discon = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "store":
          this.store(data);
          break;
      }
    });
    listen.onDisconnect.once(() => discon.unSubscribe());
  }

  store(data: Store) {
    const { key, value } = data;
    const { kvs } = this.di.modules;
    kvs.set(key, value);

    this.listen.rpc(OnStore());
  }
}
