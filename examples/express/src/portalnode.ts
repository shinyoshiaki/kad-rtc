import portalnode from "./portal";
import { Kademlia, genKid, KvsModule, PeerModule } from "../../../src";

const kad = new Kademlia(genKid(), { kvs: KvsModule, peerCreate: PeerModule });

portalnode(kad, 60000);
