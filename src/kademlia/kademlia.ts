import { DependencyInjection, dependencyInjection } from "./di";

import { Modules } from "./modules";
import { Option as OptTable } from "./ktable";
import { Peer } from "./modules/peer/base";
import findNode from "./actions/findnode";
import findValue from "./actions/findvalue";
import { listeners } from "./listeners";
import sha1 from "sha1";
import store from "./actions/store";

export type Options = Partial<OptTable> & { timeout?: number };
const initialOptions: Required<Options> = { timeout: 10_000, kBucketSize: 20 };

export default class Kademlia {
  di: DependencyInjection;

  constructor(public kid: string, modules: Modules, opt?: Partial<Options>) {
    const options = { ...initialOptions, ...opt };
    this.di = dependencyInjection(kid, modules, options);
  }

  findNode = async (searchKid: string) => {
    let target: Peer[] | undefined;

    for (
      let pre = "";
      pre !== this.di.kTable.getHash(searchKid);
      pre = this.di.kTable.getHash(searchKid)
    ) {
      target = await findNode(searchKid, this.di);
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
    const { kvs } = this.di.modules;
    const res = await findValue(key, this.di, opt);
    if (res && res.item) {
      kvs.set(key, res.item.value, res.item.msg || "");
    }
    return res;
  };

  add = (connect: Peer) => {
    listeners(connect, this.di);
  };

  dispose() {
    const { kTable } = this.di;

    kTable.allPeers.forEach(peer => peer.disconnect());
  }
}
