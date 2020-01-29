import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { listenerFindNodePeer } from "./signaling";
import { listenerFindNodeProxy } from "./node";

export default function listenFindnode(peer: Peer, di: DependencyInjection) {
  listenerFindNodePeer(peer, di);
  listenerFindNodeProxy(peer, di);
}
