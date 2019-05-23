import { DependencyInjection } from "../kademlia/di";
export declare class Count {
    private times;
    private resolve;
    private count;
    constructor(times: number, resolve: any);
    check: () => void;
}
export declare function testSetupNodes(kBucketSize: number, num: number): Promise<DependencyInjection[]>;
