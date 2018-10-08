/// <reference types="node" />
import events from "events";
import Kademlia from "../kad/kademlia";
export default class Node {
    targetUrl: string | null;
    nodeId: string;
    ev: events.EventEmitter;
    kad: Kademlia;
    constructor(targetAddress: string, targetPort: string);
    offerFirst(socket: any): void;
}
