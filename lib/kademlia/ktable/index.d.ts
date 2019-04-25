import { Option as OptBucket } from "./kbucket";
import Peer from "../modules/peer";
export declare type Option = OptBucket;
export default class Ktable {
    kid: string;
    private kbuckets;
    private k;
    constructor(kid: string, opt?: Partial<Option>);
    add(peer: Peer): void;
    readonly allPeers: Peer[];
    getAllPeers: () => Peer[];
    getPeer: (kid: string) => Peer | undefined;
    findNode: (kid: string) => Peer[];
}
