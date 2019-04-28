import Peer from "./modules/peer";
import listenFindnode from "./actions/findnode/listen";
import listenStore from "./actions/store/listen";
import { DependencyInjection } from "./di";
import listenFindValue from "./actions/findvalue/listen";

export function listeners(peer: Peer, di: DependencyInjection) {
  listenStore(peer, di);
  listenFindnode(peer, di);
  listenFindValue(peer, di);
}
