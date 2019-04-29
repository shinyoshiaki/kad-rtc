import Ktable, { Option } from "./ktable";
import Modules from "./modules";

type Options = Option;

export type DependencyInjection = {
  kTable: Ktable;
  modules: Modules;
};

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Partial<Options> = {}
): DependencyInjection => {
  return { kTable: new Ktable(kid, opt), modules };
};
