/// <reference types="node" />
import events from "events";
import Kademlia from "../kad/kademlia";
export default class PortalNode {
    ev: events.EventEmitter;
    io: any;
    kad: Kademlia;
    constructor(myPort: number, target?: {
        address: string;
        port: string;
    });
    offerFirst(socket: any): void;
    answerFirst(data: any, socketId: string): Promise<{}>;
}
