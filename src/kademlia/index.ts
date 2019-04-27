import Ktable, { Option as OptTable } from "./ktable";
import findNode from "./actions/findnode";
import Peer from "./modules/peer";

type Option = OptTable;

export default class Kademlia {
  kTable: Ktable;

  constructor(
    public kid: string,
    private module: (kid: string) => Peer,
    opt: Partial<Option> = {}
  ) {
    this.kTable = new Ktable(kid, opt);
  }

  async findNode(searchkid: string, retry = 5) {
    let target;
    for (let _ in [...Array(retry)]) {
      target = await findNode(this.module, searchkid, this.kTable);
      if (target) break;
    }
    return target;
  }

  async add(peer: Peer) {
    this.kTable.add(peer);
    await findNode(this.module, this.kid, this.kTable);
  }
}
