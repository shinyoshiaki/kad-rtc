import { ID, Peer, RPC, RPCBase } from "./base";
import WebRTC, { Signal } from "webrtc4me";
import Event from "rx.mini";
export declare const PeerModule: (kid: string) => PeerWebRTC;
export default class PeerWebRTC implements Peer {
    kid: string;
    type: string;
    peer: WebRTC;
    onRpc: Event<RPCBase & ID>;
    onDisconnect: Event<null>;
    onConnect: Event<null>;
    constructor(kid: string);
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (send: RPCBase & ID & {
        [key: string]: unknown;
    }) => void;
    eventRpc: (type: string, id: string) => Event<any>;
    createOffer: () => Promise<Signal>;
    setOffer: (offer: Signal) => Promise<Signal>;
    setAnswer: (answer: Signal) => Promise<Error | undefined>;
    disconnect: () => void;
}
