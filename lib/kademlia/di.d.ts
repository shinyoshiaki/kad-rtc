import Ktable from "./ktable";
import Modules from "./modules";
export declare type DependencyInjection = {
    kTable: Ktable;
    modules: Modules;
};
export declare const dependencyInjection: (kid: string, modules: Modules, opt?: Partial<import("./ktable/kbucket").Option>) => DependencyInjection;
