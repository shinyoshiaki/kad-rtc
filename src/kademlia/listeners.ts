import Peer from "./modules/peer/base";
import listenFindnode from "./actions/findnode/listen";
import listenStore from "./actions/store/listen";
import { DependencyInjection } from "./di";
import listenFindValue from "./actions/findvalue/listen";

export function listeners(peer: Peer, di: DependencyInjection) {
  di.kTable.add(peer);
  listenStore(peer, di);
  listenFindnode(peer, di);
  listenFindValue(peer, di);
}
