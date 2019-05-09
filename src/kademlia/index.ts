import { Option as OptTable } from "./ktable";
import findNode from "./actions/findnode";
import Peer from "./modules/peer/base";
import { DependencyInjection, dependencyInjection } from "./di";
import store from "./actions/store";
import findValue from "./actions/findvalue";
import { listeners } from "./listeners";
import Modules from "./modules";

type Options = OptTable;

export default class Kademlia {
  di: DependencyInjection;

  constructor(
    public kid: string,
    modules: Modules,
    opt: Partial<Options> = {}
  ) {
    this.di = dependencyInjection(kid, modules, opt);
  }

  async findNode(searchkid: string) {
    let target: undefined | Peer;

    for (
      let pre = "";
      pre !== this.di.kTable.getHash(searchkid);
      pre = this.di.kTable.getHash(searchkid)
    ) {
      target = await findNode(searchkid, this.di);
      if (target) break;
    }

    return target;
  }

  async store(key: string, value: string | ArrayBuffer) {
    await store(key, value, this.di);
    return key;
  }

  async findValue(key: string) {
    const res = await findValue(key, this.di);
    return res;
  }

  async add(peer: Peer) {
    const { kTable } = this.di;
    kTable.add(peer);
    listeners(peer, this.di);

    await findNode(this.kid, this.di);
  }
}
