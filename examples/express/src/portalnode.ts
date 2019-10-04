import { Kademlia, KeyValueStore, PeerModule, genKid } from "../../../src";

import portalnode from "./portal";
import { updateTimeout } from "../../../src/kademlia/const";

const kad = new Kademlia(genKid(), {
  kvs: new KeyValueStore(),
  peerCreate: PeerModule
});

updateTimeout(3000);

portalnode(kad, 60000);
