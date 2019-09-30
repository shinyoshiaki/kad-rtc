import { DependencyInjection } from "../../../di";
import FindNodePeer from "./signaling";
import FindNodeProxy from "./node";
import { Peer } from "../../../modules/peer/base";

export default function listenFindnode(peer: Peer, di: DependencyInjection) {
  new FindNodeProxy(peer, di);
  new FindNodePeer(peer, di);
}
