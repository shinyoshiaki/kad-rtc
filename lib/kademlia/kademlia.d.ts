import { DependencyInjection } from "./di";
import { Modules } from "./modules";
import { Option as OptTable } from "./ktable";
import { Peer } from "./modules/peer/base";
export declare type Options = Partial<OptTable> & {
    timeout?: number;
};
export default class Kademlia {
    kid: string;
    di: DependencyInjection;
    constructor(kid: string, modules: Modules, opt?: Options);
    findNode: (searchKid: string) => Promise<Peer[] | undefined>;
    store: (value: string | ArrayBuffer, msg?: string | undefined) => Promise<{
        item: {
            type: "Store";
            key: string;
            value: string | ArrayBuffer;
            msg: string | undefined;
        };
        peers: Peer[];
    }>;
    findValue: (key: string, opt?: {
        preferTimeout?: number | undefined;
    } | undefined) => Promise<{
        item: import(".").Item;
        peer: Peer;
    } | undefined>;
    add: (connect: Peer) => void;
    dispose(): void;
}
