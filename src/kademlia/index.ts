import { DependencyInjection, dependencyInjection } from "./di";
import KeyValueStore, { Item } from "./modules/kvs/base";
import { Peer, PeerMock } from "./modules/peer/base";
import PeerModule, { PeerMockModule } from "./modules/peer";

import EventManager from "./services/eventmanager";
import Kademlia from "./kademlia";
import Kbucket from "./ktable/kbucket";
import Ktable from "./ktable";
import { PeerCreater } from "./modules/index";
import Uuid from "./util/uuid";
import findNode from "./actions/findnode";
import findValue from "./actions/findvalue";
import genKid from "./util/kid";
import { listeners } from "./listeners";
import store from "./actions/store";

export {
  genKid,
  Item,
  EventManager,
  KeyValueStore,
  listeners,
  dependencyInjection,
  DependencyInjection,
  Peer,
  findNode,
  findValue,
  store,
  Kbucket,
  Ktable,
  PeerMock,
  Uuid,
  PeerModule,
  PeerMockModule,
  PeerCreater
};

export default Kademlia;
