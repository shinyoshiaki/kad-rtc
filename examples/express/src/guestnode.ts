import guest from "./guest";
import { Kademlia, genKid, KvsModule, PeerModule } from "../../../src";
import { updateTimeout } from "../../../src/kademlia/const";

const kad = new Kademlia(genKid(), { kvs: KvsModule, peerCreate: PeerModule });

updateTimeout(5000 * 2);

guest(kad, "http://localhost:60000");
