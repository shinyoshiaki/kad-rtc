import { Kademlia, KeyValueStore, PeerModule, genKid } from "../../../src";

import guest from "./guest";
import { updateTimeout } from "../../../src/kademlia/const";

const kad = new Kademlia(genKid(), {
  kvs: new KeyValueStore(),
  peerCreate: PeerModule
});

updateTimeout(5000 * 2);

guest(kad, "http://localhost:60000");
