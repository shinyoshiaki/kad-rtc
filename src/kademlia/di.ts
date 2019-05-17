import Ktable, { Option } from "./ktable";
import Modules from "./modules";
import Signaling from "./services/signaling";

type Options = Option;

export type DependencyInjection = {
  kTable: Ktable;
  signaling: Signaling;
  modules: Modules;
};

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Partial<Options> = {}
): DependencyInjection => {
  return {
    kTable: new Ktable(kid, opt),
    modules,
    signaling: new Signaling(modules.peerCreate)
  };
};
