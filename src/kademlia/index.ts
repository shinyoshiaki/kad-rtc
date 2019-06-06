import Ktable, { Option as OptTable } from "./ktable";
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
    private opt: Partial<Options> = {}
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

  async store(key: string, value: string | ArrayBuffer, msg?: string) {
    return await store(this.di, key, value, msg);
  }

  async findValue(key: string) {
    const res = await findValue(key, this.di);
    return res;
  }

  async add(peer: Peer, opt: Partial<{ notfind: boolean }> = {}) {
    const { kTable } = this.di;

    kTable.add(peer);
    listeners(peer, this.di);
    if (!opt.notfind) {
      await new Promise(r => setTimeout(r, 1000));
      await findNode(this.kid, this.di);
    }
    kTable.onAdd.subscribe(() => {
      if (kTable.allKids.length > kTable.kBucketSize) {
        peer.disconnect();
      }
    });
  }
}
