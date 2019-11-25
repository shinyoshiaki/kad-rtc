import EventManager from "./services/eventmanager";
import JobSystem from "./services/jobsystem";
import Ktable from "./ktable";
import { Modules } from "./modules";
import { Options } from "./kademlia";
import RpcManager from "./services/rpcmanager";
import Signaling from "./services/signaling";
export declare const dependencyInjection: (kid: string, modules: Modules, opt: Options) => {
    modules: Modules;
    kTable: Ktable;
    rpcManager: RpcManager;
    signaling: Signaling;
    jobSystem: JobSystem;
    eventManager: EventManager;
    opt: Options;
};
export declare type DependencyInjection = ReturnType<typeof dependencyInjection>;
