import WebRTC from "webrtc4me";
import Kademlia from "../kad/kademlia";
export default class PortalNode {
    io: any;
    kad: Kademlia;
    peerOffer: WebRTC | undefined;
    constructor(myPort: number, target?: {
        address: string;
        port: string;
    });
    offerFirst(socket: any): void;
    answerFirst(data: any, socketId: string): Promise<{}>;
}
