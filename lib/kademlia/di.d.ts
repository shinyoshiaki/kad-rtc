import Ktable from "./ktable";
import Modules from "./modules";
import RpcManager from "./services/rpcmanager";
import Signaling from "./services/signaling";
import JobSystem from "./services/jobsystem";
export declare type DependencyInjection = {
    kTable: Ktable;
    modules: Modules;
    rpcManager: RpcManager;
    signaling: Signaling;
    jobSystem: JobSystem;
};
export declare const dependencyInjection: (kid: string, modules: Modules, opt?: Partial<import("./ktable/kbucket").Option>) => DependencyInjection;
