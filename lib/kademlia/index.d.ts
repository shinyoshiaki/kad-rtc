import { Option as OptTable } from "./ktable";
import Peer from "./modules/peer/base";
import { DependencyInjection } from "./di";
import Modules from "./modules";
declare type Options = OptTable;
export default class Kademlia {
    kid: string;
    di: DependencyInjection;
    constructor(kid: string, modules: Modules, opt?: Partial<Options>);
    findNode(searchkid: string): Promise<Peer | undefined>;
    store(value: string): Promise<void>;
    findValue(key: string): Promise<string | undefined>;
    add(peer: Peer): Promise<void>;
}
export {};
