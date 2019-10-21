import { DependencyInjection, dependencyInjection } from "./di";

import Modules from "./modules";
import { Option as OptTable } from "./ktable";
import { Peer } from "./modules/peer/base";
import findNode from "./actions/findnode";
import findValue from "./actions/findvalue";
import { listeners } from "./listeners";
import sha1 from "sha1";
import store from "./actions/store";

export type Options = Partial<OptTable> & { timeout?: number };

export default class Kademlia {
  di: DependencyInjection;

  constructor(
    public kid: string,
    modules: Modules,
    opt: Options = { timeout: 10000 }
  ) {
    this.di = dependencyInjection(kid, modules, opt);
  }

  findNode = async (searchkid: string) => {
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
  };

  store = async (value: string | ArrayBuffer, msg?: string) => {
    const key =
      typeof value === "string" ? sha1(value) : sha1(Buffer.from(value));
    const res = await store(this.di, key, value, msg);
    return res;
  };

  findValue = async (key: string, opt?: { preferTimeout?: number }) => {
    const res = await findValue(key, this.di, opt);
    return res;
  };

  add = (connect: Peer) => {
    listeners(connect, this.di);
  };
}
