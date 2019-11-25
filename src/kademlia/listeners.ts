import { DependencyInjection } from "./di";
import { Peer } from "./modules/peer/base";
import listenFindValue from "./actions/findvalue/listen";
import listenFindnode from "./actions/findnode/listen";
import listenStore from "./actions/store/listen";

export function listeners(peer: Peer, di: DependencyInjection) {
  const { kTable, eventManager } = di;
  kTable.add(peer);
  eventManager.listen(peer);

  listenStore(peer, di);
  listenFindnode(peer, di);
  listenFindValue(peer, di);
}
