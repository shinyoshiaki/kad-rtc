import { Peer, RPC } from "../../modules/peer/base";

import Event from "rx.mini";

type WithPeer = { rpc: RPC; peer: Peer };

export default class EventManager {
  event = new Event<WithPeer>();

  constructor() {}

  listen(peer: Peer) {
    const { unSubscribe } = peer.onRpc.subscribe(rpc => {
      this.event.execute({ rpc: rpc as RPC, peer });
    });
    peer.onDisconnect.once(unSubscribe);
  }

  selectListen<T extends any>(rpcCode: keyof T) {
    const event = new Event<WithPeer>();
    this.event.subscribe(({ rpc, peer }) => {
      if (rpcCode === rpc.type) {
        event.execute({ rpc, peer });
      }
    });
    return event;
  }
}
