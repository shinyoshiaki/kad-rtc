import Ktable, { Option as OptTable } from "./ktable";
import findNode from "./actions/findnode";
import Peer from "./modules/peer";
import { DependencyInjection, dependencyInjection } from "./di";

type Options = OptTable;

export default class Kademlia {
  di: DependencyInjection;

  constructor(
    public kid: string,
    private module: (kid: string) => Peer,
    opt: Partial<Options> = {}
  ) {
    this.di = dependencyInjection(kid, module, opt);
  }

  async findNode(searchkid: string, retry = 5) {
    let target;
    for (let _ in [...Array(retry)]) {
      target = await findNode(searchkid, this.di);
      if (target) break;
    }
    return target;
  }

  async add(peer: Peer) {
    const { kTable } = this.di;
    kTable.add(peer);
    await findNode(this.kid, this.di);
  }
}
