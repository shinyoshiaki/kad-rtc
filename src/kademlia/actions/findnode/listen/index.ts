import Peer from "../../../modules/peer";
import FindNodePeer from "./peer";
import FindNodeProxy from "./proxy";
import { DependencyInjection } from "../../../di";

export default function listenFindnode(peer: Peer, di: DependencyInjection) {
  new FindNodeProxy(peer,di);
  new FindNodePeer(peer, di);
}
