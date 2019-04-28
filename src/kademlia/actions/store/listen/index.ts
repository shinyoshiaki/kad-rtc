import { Store } from "..";
import Peer from "../../../modules/peer";
import { DependencyInjection } from "../../../di";

type actions = Store;

export default function listenStore(peer: Peer, di: DependencyInjection) {
  return new ListenStore(peer, di);
}

class ListenStore {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const discon = listen.onRpc.subscribe(async (data: actions) => {
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
    const { kvs } = this.di;
    kvs.set(key, value);
  }
}
