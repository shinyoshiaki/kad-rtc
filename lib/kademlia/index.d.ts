import { Option as OptTable } from "./ktable";
import { Peer } from "./modules/peer/base";
import { DependencyInjection } from "./di";
import Modules from "./modules";
declare type Options = OptTable;
export default class Kademlia {
    kid: string;
    private opt;
    di: DependencyInjection;
    constructor(kid: string, modules: Modules, opt?: Partial<Options>);
    findNode(searchkid: string): Promise<Peer | undefined>;
    store(key: string, value: string | ArrayBuffer, msg?: string): Promise<{
        type: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    }>;
    findValue(key: string): Promise<{
        item: import("./modules/kvs/base").Item;
        peer: Peer;
    } | undefined>;
    add(connect: Peer, opt?: Partial<{
        notfind: boolean;
    }>): Promise<void>;
}
export {};
