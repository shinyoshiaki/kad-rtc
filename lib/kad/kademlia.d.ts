import WebRTC from "webrtc4me";
import Helper from "./kUtil";
import KResponder from "./kResponder";
export default class Kademlia {
    nodeId: string;
    k: number;
    kbuckets: Array<Array<WebRTC>>;
    f: Helper;
    responder: KResponder;
    dataList: Array<any>;
    keyValueList: {
        [key: string]: any;
    };
    ref: {
        [key: string]: WebRTC;
    };
    buffer: {
        [key: string]: Array<any>;
    };
    state: {
        isConnect: boolean;
        isOffer: boolean;
        findNode: string;
        hash: {};
    };
    callback: {
        onConnect: () => void;
        onAddPeer: (v?: any) => void;
        onPeerDisconnect: (v?: any) => void;
        onFindValue: (v?: any) => void;
        onFindNode: (v?: any) => void;
        onStore: (v?: any) => void;
        onApp: (v?: any) => void;
    };
    constructor(_nodeId: string, opt?: {
        kLength?: number;
    });
    store(sender: string, key: string, value: any): void;
    storeChunks(sender: string, key: string, chunks: ArrayBuffer[]): void;
    findNode(targetId: string, peer: WebRTC): void;
    findValue(key: string, cb?: (value: any) => void): void;
    doFindvalue(key: string, peer: WebRTC): Promise<void>;
    connect(peer: WebRTC): void;
    addknode(peer: WebRTC): void;
    private findNewPeer;
    private maintain;
    offer(target: string, proxy?: null): Promise<{}>;
    answer(target: string, sdp: string, proxy: string): Promise<{}>;
    send(target: string, data: any): void;
    private onCommand;
    private onRequest;
}
