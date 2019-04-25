import Peer from "../../../modules/peer";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import Ktable from "../../../ktable";
declare const FindNodePeerOffer: (sdp: any, peerkid: string) => {
    rpc: "FindNodePeerOffer";
    sdp: any;
    peerkid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export default class FindNodePeer {
    private module;
    private listen;
    private ktable;
    signaling: {
        [key: string]: Peer;
    };
    constructor(module: (kid: string) => Peer, listen: Peer, ktable: Ktable);
    findNodeProxyOpen(data: FindNodeProxyOpen): Promise<void>;
    findNodeProxyAnswer(data: FindNodeProxyAnswer): Promise<void>;
}
export {};
