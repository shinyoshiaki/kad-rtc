import { Option as OptBucket } from "./kbucket";
import Peer from "../modules/peer/base";
export declare type Option = OptBucket;
export default class Ktable {
    kid: string;
    private kbuckets;
    private k;
    constructor(kid: string, opt?: Partial<Option>);
    add(peer: Peer): void;
    findNode: (kid: string) => Peer[];
    readonly allPeers: Peer[];
    readonly allKids: string[];
    readonly kBucketSize: number;
    getPeer: (kid: string) => Peer | undefined;
    getHash: (kid: string) => string;
}
