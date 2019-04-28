import { Option as OptTable } from "./ktable";
import Peer from "./modules/peer";
import { DependencyInjection } from "./di";
declare type Options = OptTable;
export default class Kademlia {
    kid: string;
    di: DependencyInjection;
    constructor(kid: string, module: (kid: string) => Peer, opt?: Partial<Options>);
    findNode(searchkid: string, retry?: number): Promise<{
        target: Peer | undefined;
        hash: string;
    } | undefined>;
    store(value: string): Promise<void>;
    findValue(key: string): Promise<string | undefined>;
    add(peer: Peer): Promise<void>;
}
export {};
