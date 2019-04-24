import Peer from "../../../modules/peer";
import FindNodePeer from "./peer";
import Ktable from "../../../ktable";
import FindNodeProxy from "./proxy";

export default function listenFindnode(
  module: (kid: string) => Peer,
  peer: Peer,
  ktable: Ktable
) {
  new FindNodeProxy(peer, ktable);
  new FindNodePeer(module, peer, ktable);
}
