import { ID, Peer, RPC } from "../../modules/peer/base";

import Event from "rx.mini";
import { FindValue } from "../../actions/findvalue";
import RpcManager from "../rpcmanager";
import { Store } from "../../actions/store";

type WithPeer<T> = { rpc: T; peer: Peer };

export default class EventManager {
  event = new Event<WithPeer<RPC>>();
  store = new Event<WithPeer<Store & ID>>();

  findvalue = new Event<WithPeer<FindValue & ID>>();
  addPeer = new Event<Peer>();

  constructor(public rpcManager: RpcManager) {}

  listen(peer: Peer) {
    this.listenStore(peer);
    this.listenFindvalue(peer);

    {
      const { unSubscribe } = peer.onRpc.subscribe(rpc => {
        this.event.execute({ rpc: rpc as RPC, peer });
      });
      peer.onDisconnect.once(unSubscribe);
    }

    this.addPeer.execute(peer);
  }

  private listenStore(peer: Peer) {
    this.rpcManager
      .asObservable<Store>("Store", peer)
      .subscribe(rpc => this.store.execute({ rpc: rpc as Store & ID, peer }));
  }

  private listenFindvalue(peer: Peer) {
    this.rpcManager
      .asObservable<FindValue>("FindValue", peer)
      .subscribe(rpc =>
        this.findvalue.execute({ rpc: rpc as FindValue & ID, peer })
      );
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
