import Ktable, { Option as OptTable } from "./ktable";
import Peer from "./modules/peer";
declare type Option = OptTable;
export default class Kademlia {
    private module;
    kid: string;
    kTable: Ktable;
    constructor(module: (kid: string) => Peer, opt?: Partial<Option>);
    findNode(searchkid: string): Promise<void>;
}
export {};
