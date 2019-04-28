import Ktable, { Option } from "./ktable";
import KeyValueStore from "./modules/kvs";
import Peer from "./modules/peer";

type Options = Option;

export type DependencyInjection = {
  peerModule: (kid: string) => Peer;
  kTable: Ktable;
  kvs: KeyValueStore;
};

export const dependencyInjection = (
  kid: string,
  peerModule: (kid: string) => Peer,
  opt: Partial<Options> = {}
): DependencyInjection => {
  return { kTable: new Ktable(kid, opt), kvs: new KeyValueStore(), peerModule };
};
