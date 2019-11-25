import { DependencyInjection } from "../../../di";
import Node from "./node";
import { Peer } from "../../../modules/peer/base";
import Signaling from "./signaling";

export default function listenFindnode(peer: Peer, di: DependencyInjection) {
  new Node(peer, di);
  new Signaling(peer, di);
}
