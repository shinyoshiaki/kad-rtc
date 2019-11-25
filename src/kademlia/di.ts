import EventManager from "./services/eventmanager";
import JobSystem from "./services/jobsystem";
import Ktable from "./ktable";
import { Modules } from "./modules";
import { Options } from "./kademlia";
import RpcManager from "./services/rpcmanager";
import Signaling from "./services/signaling";

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Required<Options>
) => {
  const rpcManager = new RpcManager();
  return {
    modules,
    kTable: new Ktable(kid, opt),
    rpcManager,
    signaling: new Signaling(modules.peerCreate),
    jobSystem: new JobSystem(),
    eventManager: new EventManager(rpcManager),
    opt
  };
};

export type DependencyInjection = ReturnType<typeof dependencyInjection>;
