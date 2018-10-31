import WebRTC from "webrtc4me";
import Helper from "./kUtil";
import KResponder from "./kResponder";
export declare function excuteEvent(ev: any, v?: any): void;
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
        isFirstConnect: boolean;
        isOffer: boolean;
        findNode: string;
        hash: {};
    };
    callback: {
        onConnect: () => void;
        onAddPeer: (v?: any) => void;
        onPeerDisconnect: (v?: any) => void;
        _onFindValue: (v?: any) => void;
        _onFindNode: (v?: any) => void;
        onApp: (v?: any) => void;
    };
    onStore: {
        [key: string]: (v: any) => void;
    };
    onFindValue: {
        [key: string]: (v: any) => void;
    };
    onFindNode: {
        [key: string]: (v: any) => void;
    };
    events: {
        store: {
            [key: string]: (v: any) => void;
        };
        findvalue: {
            [key: string]: (v: any) => void;
        };
        findnode: {
            [key: string]: (v: any) => void;
        };
    };
    constructor(_nodeId: string, opt?: {
        kLength?: number;
    });
    store(sender: string, key: string, value: any, opt?: {
        excludeId?: string;
    }): void;
    storeChunks(sender: string, key: string, chunks: ArrayBuffer[], opt?: {
        excludeId?: string;
    }): void;
    findNode(targetId: string, peer: WebRTC): void;
    findValue(key: string, opt?: {
        ownerId?: string;
    }): Promise<any>;
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
