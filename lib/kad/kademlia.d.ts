import WebRTC from "simple-datachannel/lib/NodeRTC";
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
    state: {
        isOffer: boolean;
        findNode: string;
        hash: {};
    };
    private onPing;
    callback: {
        onAddPeer: (v?: any) => void;
        onPeerDisconnect: (v?: any) => void;
        onCommand: (v?: any) => void;
        onFindValue: (v?: any) => void;
        onFindNode: (v?: any) => void;
        _onPing: {
            [key: string]: () => void;
        };
    };
    constructor(_nodeId: string);
    ping(peer: WebRTC): Promise<{}>;
    storeFormat(sender: string, key: string, value: any): string;
    store(sender: string, key: string, value: any): Promise<void>;
    findNode(targetId: string, peer: WebRTC): Promise<void>;
    findValue(key: string, cb?: (value: any) => void): void;
    doFindvalue(key: string, peer: WebRTC): Promise<void>;
    addknode(peer: WebRTC): void;
    findNewPeer(peer: WebRTC): void;
    onRequest(datalink: string): void;
    maintain(network: any): Promise<void>;
    offer(target: string, proxy?: null): Promise<{}>;
    answer(target: string, sdp: string, proxy: string): Promise<{}>;
    send(target: string, data: any): void;
    onCommand(datachannel: any): void;
}
