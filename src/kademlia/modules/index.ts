import KeyValueStore from "./kvs/base";
import { Peer } from "./peer/base";

export type PeerCreater = (kid: string) => Peer;

export default interface Modules {
  peerCreate: PeerCreater;
  kvs: KeyValueStore;
}
