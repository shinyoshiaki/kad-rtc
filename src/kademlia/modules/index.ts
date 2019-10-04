import KeyValueStore from "./kvs/base";
import { Peer } from "./peer/base";

export default interface Modules {
  peerCreate: (kid: string) => Peer;
  kvs: KeyValueStore;
}
