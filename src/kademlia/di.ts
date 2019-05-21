import Ktable, { Option } from "./ktable";
import Modules from "./modules";
import EventManager from "./services/eventmanager";

type Options = Option;

export type DependencyInjection = {
  kTable: Ktable;
  modules: Modules;
  eventManager: EventManager;
};

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Partial<Options> = {}
): DependencyInjection => {
  return {
    kTable: new Ktable(kid, opt),
    modules,
    eventManager: new EventManager()
  };
};
