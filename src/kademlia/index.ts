import Ktable, { Option as OptTable } from "./ktable";
import sha1 from "sha1";
type Option = {} & OptTable;

export default class Kademlia {
  kid = sha1(Math.random().toString()).toString();
  kTable: Ktable;

  constructor(opt: Partial<Option>) {
    const { kid } = this;

    this.kTable = new Ktable(kid, opt);
  }

  findNode(kid: string) {
    const peers = this.kTable.findNode(kid);
  }
}
