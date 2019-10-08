import { Kademlia, KeyValueStore, PeerModule, genKid } from "../../../src";

import portalnode from "./portal";

const kad = new Kademlia(
  genKid(),
  {
    kvs: new KeyValueStore(),
    peerCreate: PeerModule
  },
  { timeout: 3000 }
);

portalnode(kad, 60000);
