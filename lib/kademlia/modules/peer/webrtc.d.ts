import { ID, Peer, RPC, RPCBase } from "./base";
import WebRTC, { Signal } from "webrtc4me";
import Event from "rx.mini";
export declare const PeerModule: (kid: string) => PeerWebRTC;
export default class PeerWebRTC implements Peer {
    kid: string;
    type: string;
    SdpType: "offer" | "answer" | undefined;
    peer: WebRTC;
    onRpc: Event<RPCBase & ID>;
    onDisconnect: Event<null>;
    onConnect: Event<null>;
    constructor(kid: string);
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (send: RPCBase & ID & {
        [key: string]: unknown;
    }) => void;
    eventRpc: (type: string, transactionId: string) => Event<any>;
    createOffer: () => Promise<Signal | RTCSessionDescription>;
    setOffer: (offer: Signal, timeout?: number) => Promise<Signal>;
    setAnswer: (answer: Signal, timeout?: number) => Promise<Error | undefined>;
    disconnect: () => void;
}
