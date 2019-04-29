import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import FindValuePeer from "./peer";
import FindValueProxy from "./proxy";

export default function listenFindValue(peer: Peer, di: DependencyInjection) {
  new FindValuePeer(peer, di);
  new FindValueProxy(peer, di);
}
