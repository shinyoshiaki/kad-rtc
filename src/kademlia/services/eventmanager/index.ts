import RpcManager, { ID } from "../rpcmanager";

import Event from "rx.mini";
import { FindNode } from "../../actions/findnode";
import { FindValue } from "../../actions/findvalue";
import { Peer } from "../../modules/peer/base";
import { Store } from "../../actions/store";

export default class EventManager {
  store = new Event<Store & ID>();
  findnode = new Event<FindNode & ID>();
  findvalue = new Event<FindValue & ID>();

  constructor(public rpcManager: RpcManager) {}

  listen(peer: Peer) {
    this.listenStore(peer);
    this.listenFindnode(peer);
    this.listenFindvalue(peer);
  }

  private listenStore(peer: Peer) {
    this.rpcManager
      .asObservable<Store>("Store", peer)
      .subscribe(this.store.execute);
  }

  private listenFindnode(peer: Peer) {
    this.rpcManager
      .asObservable<FindNode>("FindNode", peer)
      .subscribe(this.findnode.execute);
  }

  private listenFindvalue(peer: Peer) {
    this.rpcManager
      .asObservable<FindValue>("FindValue", peer)
      .subscribe(this.findvalue.execute);
  }
}
