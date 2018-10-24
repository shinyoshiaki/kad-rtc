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
        isOffer: boolean;
        findNode: string;
        hash: {};
        maintain: boolean;
    };
    private onPing;
    callback: {
        onAddPeer: (v?: any) => void;
        onPeerDisconnect: (v?: any) => void;
        onFindValue: (v?: any) => void;
        onFindNode: (v?: any) => void;
        onStore: (v?: any) => void;
        _onPing: {
            [key: string]: () => void;
        };
        onApp: (v?: any) => void;
    };
    constructor(_nodeId: string, opt?: {
        kLength?: number;
    });
    ping(peer: WebRTC): Promise<{}>;
    store(sender: string, key: string, value: any): Promise<void>;
    findNode(targetId: string, peer: WebRTC): Promise<void>;
    findValue(key: string, cb?: (value: any) => void): void;
    doFindvalue(key: string, peer: WebRTC): Promise<void>;
    addknode(peer: WebRTC): void;
    private findNewPeer;
    private onRequest;
    private maintain;
    offer(target: string, proxy?: null): Promise<{}>;
    answer(target: string, sdp: string, proxy: string): Promise<{}>;
    send(target: string, data: any): void;
    private onCommand;
}
