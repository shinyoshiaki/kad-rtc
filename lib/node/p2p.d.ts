import Kademlia from "../kad/kademlia";
import { IEvents } from "../util";
export default class P2P {
    kad: Kademlia;
    private p2pMsgBuffer;
    private onP2P;
    events: {
        p2p: IEvents;
    };
    constructor(kad: Kademlia);
    send(target: string, data: {
        text?: string;
        file?: {
            name: string;
            value: ArrayBuffer[];
        };
    }): Promise<any>;
    private responder;
}
