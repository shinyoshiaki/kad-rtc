/// <reference types="socket.io" />
/// <reference types="socket.io-client" />
import Kademlia from "../../kademlia";
import Peer from "../../kademlia/modules/peer/webrtc";
import Event from "../../utill/event";
declare type Option = {
    port: number;
    target?: {
        url: string;
        port: number;
    };
};
declare const Request: (clientKid: string) => {
    rpc: "Request";
    clientKid: string;
};
declare type Request = ReturnType<typeof Request>;
declare const Offer: (sdp: string, serverKid: string) => {
    rpc: "Offer";
    sdp: string;
    serverKid: string;
};
declare type Offer = ReturnType<typeof Offer>;
export default class Portal {
    private opt;
    kid: string;
    kademlia: Kademlia;
    peers: {
        [key: string]: Peer;
    };
    onConnect: Event<{}>;
    constructor(opt: Option);
    offer(socket: SocketIO.Socket, data: Request): Promise<void>;
    answer(socket: SocketIOClient.Socket, data: Offer): Promise<void>;
}
export {};
