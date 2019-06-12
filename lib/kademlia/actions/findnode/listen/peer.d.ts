import Peer from "../../../modules/peer/base";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
declare const FindNodePeerOffer: (peerkid: string, sdp?: object | undefined) => {
    rpc: "FindNodePeerOffer";
    sdp: object | undefined;
    peerkid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export default class FindNodePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findNodeProxyOpen(data: FindNodeProxyOpen & ID): Promise<void>;
    findNodeProxyAnswer(data: FindNodeProxyAnswer): Promise<void>;
}
export {};
