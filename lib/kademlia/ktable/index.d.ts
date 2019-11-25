import Kbucket, { Option as OptBucket } from "./kbucket";
import { Peer } from "../modules/peer/base";
export declare type Option = OptBucket;
export default class Ktable {
    kid: string;
    readonly kBuckets: Kbucket[];
    private k;
    pack: {
        event: <T>() => import("rx.mini").default<T>;
        finishAll: () => void;
    };
    onAdd: import("rx.mini").default<Peer>;
    constructor(kid: string, opt?: Partial<Option>);
    add(peer: Peer): void;
    findNode: (kid: string) => Peer[];
    readonly allPeers: Peer[];
    readonly allKids: string[];
    readonly kBucketSize: number;
    getPeer: (kid: string) => Peer | undefined;
    getHash: (kid: string) => string;
    rmPeer: (kid: string) => void;
}
