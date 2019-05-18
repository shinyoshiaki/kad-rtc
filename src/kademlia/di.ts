import Ktable, { Option } from "./ktable";
import Modules from "./modules";
import JobSystem from "./services/jobsystem";

type Options = Option;

export type DependencyInjection = {
  kTable: Ktable;
  modules: Modules;
  jobs: JobSystem;
};

export const dependencyInjection = (
  kid: string,
  modules: Modules,
  opt: Partial<Options> = {}
): DependencyInjection => {
  return {
    kTable: new Ktable(kid, opt),
    modules,
    jobs: new JobSystem({ a: 3 })
  };
};
