import { Kademlia, KeyValueStore, PeerModule, genKid } from "../../../src";

import guest from "./guest";

const kad = new Kademlia(
  genKid(),
  {
    kvs: new KeyValueStore(),
    peerCreate: PeerModule
  },
  { timeout: 10_000 }
);

guest(kad, "http://localhost:60000");
