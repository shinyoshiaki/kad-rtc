import KeyValueStore from "./kvs/base";
import { Peer } from "./peer/base";
export declare type PeerCreator = (kid: string) => Peer;
export declare type Modules = {
    peerCreate: PeerCreator;
    kvs: KeyValueStore;
};
