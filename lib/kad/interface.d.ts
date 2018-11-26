export interface Req {
    nodeId: string;
    data: any;
}
export interface StoreFormat {
    sender: string;
    key: string;
    value: any;
    pubKey: string;
    hash: string;
    sign: string;
    persist?: boolean;
}
export interface StoreChunks {
    sender: string;
    key: string;
    value: any;
    index: number;
    pubKey: string;
    hash: string;
    sign: string;
    size: number;
}
export interface Findnode {
    targetKey: string;
}
export interface FindnodeR {
    closeIds: Array<string>;
}
export interface FindValue {
    targetKey: string;
}
export interface FindValueR {
    success?: {
        value: string;
        key: string;
    };
    fail?: {
        ids: string[];
        targetNode: string;
        targetKey: string;
        to: string;
    };
    chunks?: {
        value: any;
        key: string;
        index: number;
        size: number;
    };
}
export interface StoreSignaling {
    type: string;
    target: string;
    sdp: any;
    proxy: any;
}
export interface network {
    layer: "networkLayer";
    type: string;
    nodeId: string;
    data: any;
    date: string;
    hash: any;
}
export interface p2pMessage {
    sender: string;
    target: string;
    file?: {
        index: number;
        length: number;
        chunk: any;
        filename: string;
    };
    text?: string;
}
export interface p2pMessageEvent {
    nodeId: string;
    file?: any;
    filename?: string;
    text?: string;
}
