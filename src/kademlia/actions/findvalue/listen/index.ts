import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { listenerFindValueProxy } from "./node";
import { listenerFindValueSignaling } from "./signaling";

export default function listenFindValue(peer: Peer, di: DependencyInjection) {
  listenerFindValueProxy(peer, di);
  listenerFindValueSignaling(peer, di);
}
