export declare class Count {
    private times;
    private resolve;
    private count;
    constructor(times: number, resolve: any);
    check: () => void;
}
export declare function testSetupNodes(kBucketSize: number, num: number): Promise<{
    modules: import("../kademlia/modules").default;
    kTable: import("../kademlia/ktable").default;
    rpcManager: import("../kademlia/services/rpcmanager").default;
    signaling: import("../kademlia/services/signaling").default;
    jobSystem: import("../kademlia/services/jobsystem").default;
    eventManager: import("../kademlia/services/eventmanager").default;
}[]>;
