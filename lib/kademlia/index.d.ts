/// <reference types="node" />
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
    store(key: string, value: string | ArrayBuffer): Promise<string>;
    findValue(key: string): Promise<string | Buffer | ArrayBuffer | undefined>;
    add(peer: Peer, opt?: Partial<{
        notfind: boolean;
    }>): Promise<void>;
}
export {};
