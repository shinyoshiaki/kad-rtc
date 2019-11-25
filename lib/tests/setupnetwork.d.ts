import Kademlia, { PeerCreator } from "../kademlia";
import { Options } from "../kademlia";
export declare function testSetupNodes(num: number, PeerModule: PeerCreator, opt: Options): Promise<Kademlia[]>;
