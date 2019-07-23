/// <reference types="node" />
import Event from "rx.mini";
import { Signal } from "webrtc4me";
export declare type RPC = {
    rpc: string;
    [key: string]: string | Buffer | ArrayBuffer;
    id: string;
};
export declare type Peer = PeerClass & PeerProps;
declare class PeerClass {
    kid: string;
    constructor(kid: string);
}
declare type PeerProps = {
    type: string;
    onRpc: Event<any>;
    onDisconnect: Event;
    onConnect: Event;
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (data: {
        rpc: string;
        id: string;
    }) => void;
    eventRpc: <T extends {
        rpc: string;
    }>(rpc: T["rpc"], id: string) => Event<T>;
    createOffer: () => Promise<Signal>;
    setOffer: (sdp: Signal) => Promise<Signal>;
    setAnswer: (sdp: Signal) => Promise<Error | undefined>;
    disconnect: () => void;
};
export declare class PeerMock implements Peer {
    kid: string;
    type: string;
    onRpc: Event<any>;
    onDisconnect: Event<null>;
    onConnect: Event<null>;
    constructor(kid: string);
    rpc: (data: {
        rpc: string;
        id: string;
    }) => void;
    parseRPC: (data: ArrayBuffer) => any;
    eventRpc: <T extends {
        rpc: string;
    }>(rpc: T["rpc"], id: string) => Event<T>;
    createOffer: () => Promise<any>;
    setOffer: (sdp: Signal) => Promise<any>;
    setAnswer: (sdp: Signal) => Promise<any>;
    disconnect: () => void;
}
export {};
