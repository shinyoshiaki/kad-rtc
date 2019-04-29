import Ktable from "./ktable";
import KeyValueStore from "./modules/kvs/base";
import Peer from "./modules/peer/base";
export declare type DependencyInjection = {
    peerModule: (kid: string) => Peer;
    kTable: Ktable;
    kvs: KeyValueStore;
};
export declare const dependencyInjection: (kid: string, peerModule: (kid: string) => Peer, opt?: Partial<import("./ktable/kbucket").Option>) => DependencyInjection;
