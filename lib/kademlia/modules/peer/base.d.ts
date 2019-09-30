/// <reference types="node" />
import Event from "rx.mini";
import { Signal } from "webrtc4me";
export declare type ID = {
    id: string;
};
export declare type RPCBase = {
    type: string;
};
export declare type RPC = {
    type: string;
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
    onRpc: Event<RPCBase & ID>;
    onDisconnect: Event;
    onConnect: Event;
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (data: RPCBase & ID & {
        [key: string]: unknown;
    }) => void;
    eventRpc: <T extends {
        type: string;
    }>(rpc: T["type"], id: string) => Event<T>;
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
        type: string;
        id: string;
    }) => void;
    parseRPC: (data: ArrayBuffer) => any;
    eventRpc: <T extends {
        type: string;
    }>(rpc: T["type"], id: string) => Event<T>;
    createOffer: () => Promise<any>;
    setOffer: (sdp: Signal) => Promise<any>;
    setAnswer: (sdp: Signal) => Promise<any>;
    disconnect: () => void;
}
export {};
