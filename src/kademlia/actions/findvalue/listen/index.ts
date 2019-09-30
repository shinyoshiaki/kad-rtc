import { DependencyInjection } from "../../../di";
import FindValuePeer from "./signaling";
import FindValueProxy from "./node";
import { Peer } from "../../../modules/peer/base";

export default function listenFindValue(peer: Peer, di: DependencyInjection) {
  new FindValuePeer(peer, di);
  new FindValueProxy(peer, di);
}
