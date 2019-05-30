import portalnode from "./portal";
import { Kademlia, genKid, KvsModule, PeerModule } from "../../../src";
import { updateTimeout } from "../../../src/kademlia/const";

const kad = new Kademlia(genKid(), { kvs: KvsModule, peerCreate: PeerModule });

updateTimeout(3000);

portalnode(kad, 60000);
