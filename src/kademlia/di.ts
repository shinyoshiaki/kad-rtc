import Ktable, { Option } from "./ktable";

import EventManager from "./services/eventmanager";
import JobSystem from "./services/jobsystem";
import Modules from "./modules";
import RpcManager from "./services/rpcmanager";
import Signaling from "./services/signaling";

type Options = Option;

export type DependencyInjection = ReturnType<typeof dependencyInjection>;

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Partial<Options> = {}
) => {
  const rpcManager = new RpcManager();
  return {
    modules,
    kTable: new Ktable(kid, opt),
    rpcManager,
    signaling: new Signaling(modules.peerCreate),
    jobSystem: new JobSystem(),
    eventManager: new EventManager(rpcManager)
  };
};
