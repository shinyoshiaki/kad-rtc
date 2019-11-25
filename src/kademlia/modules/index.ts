import KeyValueStore from "./kvs/base";
import { Peer } from "./peer/base";

export type PeerCreator = (kid: string) => Peer;

export type Modules = {
  peerCreate: PeerCreator;
  kvs: KeyValueStore;
};
