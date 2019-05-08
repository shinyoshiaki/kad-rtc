import guest from "./guest";
import { Kademlia, genKid, KvsModule, PeerModule } from "../../..";

const kad = new Kademlia(genKid(), { kvs: KvsModule, peerCreate: PeerModule });

guest(kad, "http://localhost:60000");
