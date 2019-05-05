import Kademlia from "./kademlia";
import { PeerModule } from "./kademlia/modules/peer/webrtc";
import GuestNode from "./node/guest";
<<<<<<< HEAD
export { PeerModule, Kademlia, GuestNode };
=======
import PortalNode from "./node/portal";
import { KvsModule } from "./kademlia/modules/kvs/base";
export { PeerModule, Kademlia, GuestNode, PortalNode, KvsModule };
>>>>>>> master
