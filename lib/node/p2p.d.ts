import Kademlia from "../kad/kademlia";
import { message } from "webrtc4me/lib/interface";
export default class P2P {
    kad: Kademlia;
    p2pMsgBuffer: {
        [key: string]: any[];
    };
    onP2P: {
        [key: string]: (payload: p2pMessageEvent) => void;
    };
    events: {
        p2p: {
            [key: string]: (payload: p2pMessageEvent) => void;
        };
    };
    constructor(kad: Kademlia);
    send(target: string, data: {
        text?: string;
        file?: {
            name: string;
            value: ArrayBuffer[];
        };
    }): Promise<any>;
    responder(message: message): void;
}
