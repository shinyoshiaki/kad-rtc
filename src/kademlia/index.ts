import Ktable, { Option as OptTable } from "./ktable";
import sha1 from "sha1";
import findNode from "./actions/findnode";
import Peer from "./modules/peer";

type Option = OptTable;

export default class Kademlia {
  kid = sha1(Math.random().toString()).toString();
  kTable: Ktable;

  constructor(
    private module: (kid: string) => Peer,
    opt: Partial<Option> = {}
  ) {
    const { kid } = this;

    this.kTable = new Ktable(kid, opt);
  }

  async findNode(kid: string) {
    const peers = this.kTable.findNode(kid);
    const connects = await findNode(this.module, kid, peers);
    connects.forEach(peer => this.kTable.add(peer));
  }
}
