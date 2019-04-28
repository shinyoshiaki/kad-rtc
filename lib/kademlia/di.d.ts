import Ktable from "./ktable";
import KeyValueStore from "./modules/kvs";
import Peer from "./modules/peer";
export declare type DependencyInjection = {
    peerModule: (kid: string) => Peer;
    kTable: Ktable;
    kvs: KeyValueStore;
};
export declare const dependencyInjection: (kid: string, peerModule: (kid: string) => Peer, opt?: Partial<import("./ktable/kbucket").Option>) => DependencyInjection;
