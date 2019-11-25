import { PeerCreator } from "../kademlia";
export declare class Count {
    private times;
    private resolve;
    private count;
    constructor(times: number, resolve: any);
    check: () => void;
}
export declare function testSetupNodes(kBucketSize: number, num: number, PeerModule: PeerCreator, timeout: number): Promise<{
    modules: import("../kademlia/modules").Modules;
    kTable: import("../kademlia").Ktable;
    rpcManager: import("../kademlia/services/rpcmanager").default;
    signaling: import("../kademlia/services/signaling").default;
    jobSystem: import("../kademlia/services/jobsystem").default;
    eventManager: import("../kademlia").EventManager;
    opt: import("../kademlia").Options;
}[]>;
