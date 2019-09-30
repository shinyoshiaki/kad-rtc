import RpcManager, { ID } from "../rpcmanager";

import Event from "rx.mini";
import { FindNode } from "../../actions/findnode";
import { FindValue } from "../../actions/findvalue";
import { Peer } from "../../modules/peer/base";
import { Store } from "../../actions/store";

type Execute<T> = { res: T; peer: Peer };

export default class EventManager {
  store = new Event<Execute<Store & ID>>();
  findnode = new Event<Execute<FindNode & ID>>();
  findvalue = new Event<Execute<FindValue & ID>>();

  constructor(public rpcManager: RpcManager) {}

  listen(peer: Peer) {
    this.listenStore(peer);
    this.listenFindnode(peer);
    this.listenFindvalue(peer);
  }

  private listenStore(peer: Peer) {
    this.rpcManager
      .asObservable<Store>("Store", peer)
      .subscribe(res => this.store.execute({ res, peer }));
  }

  private listenFindnode(peer: Peer) {
    this.rpcManager
      .asObservable<FindNode>("FindNode", peer)
      .subscribe(res => this.findnode.execute({ res, peer }));
  }

  private listenFindvalue(peer: Peer) {
    this.rpcManager
      .asObservable<FindValue>("FindValue", peer)
      .subscribe(res => this.findvalue.execute({ res, peer }));
  }
}
