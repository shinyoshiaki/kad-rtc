import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { expose } from "../../../../vendor/airpc/main";
import { exposer } from "../../rpc";

export class ListenStore {
  constructor(private di: DependencyInjection) {}

  store(key: string, value: string | ArrayBuffer, msg?: string) {
    const { kvs } = this.di.modules;

    kvs.set(key, value, msg as any);

    return true;
  }
}

export default function listenStore(peer: Peer, di: DependencyInjection) {
  expose(new ListenStore(di), exposer(peer));
}
