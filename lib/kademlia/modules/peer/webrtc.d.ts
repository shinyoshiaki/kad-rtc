import { RPC, Peer } from "./base";
import Event from "rx.mini";
import WebRTC, { Signal } from "webrtc4me";
export declare const PeerModule: (kid: string) => PeerWebRTC;
export default class PeerWebRTC implements Peer {
    kid: string;
    type: string;
    peer: WebRTC;
    onRpc: Event<RPC>;
    onDisconnect: Event<null>;
    onConnect: Event<null>;
    constructor(kid: string);
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (send: RPC) => void;
    eventRpc: (rpc: string, id: string) => Event<any>;
    createOffer: () => Promise<Signal>;
    setOffer: (offer: Signal) => Promise<Signal>;
    setAnswer: (answer: Signal) => Promise<Error | undefined>;
    disconnect: () => void;
}
