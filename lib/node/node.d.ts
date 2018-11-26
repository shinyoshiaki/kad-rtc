import WebRTC from "webrtc4me";
import Kademlia from "../kad/kademlia";
export default class Node {
    targetUrl: string | undefined;
    kad: Kademlia;
    peerOffer: WebRTC | undefined;
    constructor(target: {
        address: string;
        port: string;
    }, opt?: {
        pubkey?: string;
        seckey?: string;
    });
    offerFirst(socket: any): void;
}
