import Kademlia from "../kad/kademlia";
import { IEvents } from "../util";
export default class BroadCast {
    kad: Kademlia;
    private hashs;
    private onBroadcast;
    events: {
        broadcast: IEvents;
    };
    constructor(kad: Kademlia);
    broadcast(msg: string): void;
    private responder;
}
