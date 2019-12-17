import { Peer, RPC } from "../../modules/peer/base";

import Event from "rx.mini";

type WithPeer<T> = { rpc: T; peer: Peer };

export default class EventManager {
  event = new Event<WithPeer<RPC>>();

  constructor() {}

  listen(peer: Peer) {
    const { unSubscribe } = peer.onRpc.subscribe(rpc => {
      this.event.execute({ rpc: rpc as RPC, peer });
    });
    peer.onDisconnect.once(unSubscribe);
  }

  selectListen<T extends RPC>(rpcCode: T["type"]) {
    const event = new Event<WithPeer<T>>();
    this.event.subscribe(({ rpc, peer }) => {
      if (rpcCode === rpc.type) {
        event.execute({ rpc: rpc as T, peer });
      }
    });
    return event;
  }
}
