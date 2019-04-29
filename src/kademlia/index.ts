import { Option as OptTable } from "./ktable";
import findNode from "./actions/findnode";
import Peer from "./modules/peer/base";
import { DependencyInjection, dependencyInjection } from "./di";
import store from "./actions/store";
import findValue from "./actions/findvalue";

type Options = OptTable;

export default class Kademlia {
  di: DependencyInjection;

  constructor(
    public kid: string,
    peerModule: (kid: string) => Peer,
    opt: Partial<Options> = {}
  ) {
    this.di = dependencyInjection(kid, peerModule, opt);
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

  async store(value: string) {
    await store(value, this.di);
  }

  async findValue(key: string) {
    const res = await findValue(key, this.di);
    return res;
  }

  async add(peer: Peer) {
    const { kTable } = this.di;
    kTable.add(peer);
    await findNode(this.kid, this.di);
  }
}
