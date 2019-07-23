import { Peer } from "./peer/base";
import KevValueStore from "./kvs/base";

export default interface Modules {
  peerCreate: (kid: string) => Peer;
  kvs: KevValueStore;
}
