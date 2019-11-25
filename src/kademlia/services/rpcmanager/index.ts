import { ID, Peer, RPCBase } from "../../modules/peer/base";

import Event from "rx.mini";
import Uuid from "../../util/uuid";

export default class RpcManager {
  private uuid = new Uuid();

  getWait = <T extends RPCBase>(
    peer: Peer,
    rpc: RPCBase,
    id?: string,
    waitFor?: T["type"]
  ) => {
    this.uuid.setPrefix(peer.kid);
    id = id || this.uuid.get() + rpc.type;

    const event = new Event<T & ID>();

    const { unSubscribe } = peer.onRpc.subscribe(v => {
      if (v.id === id)
        if (!waitFor || (waitFor && v.type === waitFor)) {
          event.execute(v as T & ID);
          unSubscribe();
        }
    });

    peer.rpc({ ...rpc, id });

    return event.asPromise;
  };

  run = (peer: Peer, rpc: { type: string; [key: string]: any }) => {
    this.uuid.setPrefix(peer.kid);
    const id = this.uuid.get();
    peer.rpc({ ...rpc, id });
  };

  asObservable = <T extends RPCBase>(type: T["type"], listen: Peer) => {
    const event = new Event<T & ID>();
    const { unSubscribe } = listen.onRpc.subscribe(data => {
      if (data.type === type) {
        event.execute(data as T & ID);
      }
    });
    listen.onDisconnect.once(unSubscribe);
    return event;
  };
}
