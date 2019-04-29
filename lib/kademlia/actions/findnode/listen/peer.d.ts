import Peer from "../../../modules/peer/base";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import { DependencyInjection } from "../../../di";
declare const FindNodePeerOffer: (sdp: any, peerkid: string) => {
    rpc: "FindNodePeerOffer";
    sdp: any;
    peerkid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export default class FindNodePeer {
    private listen;
    private di;
    signaling: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findNodeProxyOpen(data: FindNodeProxyOpen): Promise<void>;
    findNodeProxyAnswer(data: FindNodeProxyAnswer): Promise<void>;
}
export {};
