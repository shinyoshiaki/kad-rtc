import Kademlia from "../kad/kademlia";
import { message } from "webrtc4me/lib/interface";
import { IEvents } from "../util";
export default class BroadCast {
    kad: Kademlia;
    hashs: string[];
    onBroadcast: IEvents;
    events: {
        broadcast: IEvents;
    };
    constructor(kad: Kademlia);
    broadcast(msg: string): void;
    responder(message: message): void;
}
