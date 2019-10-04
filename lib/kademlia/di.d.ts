import Ktable from "./ktable";
import EventManager from "./services/eventmanager";
import JobSystem from "./services/jobsystem";
import Modules from "./modules";
import RpcManager from "./services/rpcmanager";
import Signaling from "./services/signaling";
export declare const dependencyInjection: (kid: string, modules: Modules, opt?: Partial<import("./ktable/kbucket").Option>) => {
    modules: Modules;
    kTable: Ktable;
    rpcManager: RpcManager;
    signaling: Signaling;
    jobSystem: JobSystem;
    eventManager: EventManager;
};
export declare type DependencyInjection = ReturnType<typeof dependencyInjection>;
