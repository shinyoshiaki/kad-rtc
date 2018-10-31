import WebRTC from "webrtc4me";
export default class KUtil {
    kbuckets: Array<Array<WebRTC>>;
    k: number;
    nodeId: string;
    constructor(k: number, kbuckets: Array<Array<WebRTC>>, nodeId: string);
    getAllPeers(): Array<WebRTC>;
    getPeer(targetId: string): WebRTC | undefined;
    getCloseEstPeersList(key: string, opt?: {
        excludeId: null;
    }): WebRTC[];
    getCloseIDs(targetID: string): string[];
    getCloseEstIdsList(key: string, opt?: {
        excludeId: null;
    }): string[];
    getPeerFromnodeId(nodeId: string): WebRTC | undefined;
    getCloseEstPeer(_key: string, opt?: {
        excludeId?: string;
    }): WebRTC | undefined;
    getCloseEstDist(key: string): number;
    getCloseIds(targetId: string): string[];
    getAllPeerIds(): (string | undefined)[];
    isPeerExist(id: string): boolean;
    getPeerNum(): number;
    cleanDiscon(): void;
    getKbucketNum(): number;
    isNodeExist(nodeId: string): boolean;
    getClosePeers(targetId: string, opt?: {
        excludeId?: string;
    }): WebRTC[];
}
