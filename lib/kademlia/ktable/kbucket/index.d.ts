import Peer from "../../modules/peer/base";
export declare type Option = {
    kBucketSize: number;
};
export default class Kbucket {
    private k;
    peers: {
        kid: string;
        peer: Peer;
    }[];
    constructor(opt?: Partial<Option>);
    add(peer: Peer): void;
    readonly length: number;
}
