import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
import { Peer } from "../../../modules/peer/base";
export default class FindNodePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findNodeProxyOpen: (data: {
        rpc: "FindNodeProxyOpen";
        finderkid: string;
    } & ID) => Promise<void>;
    findNodeProxyAnswer: (data: {
        rpc: "FindNodeProxyAnswer";
        sdp: string;
        finderkid: string;
    }) => Promise<void>;
}
declare const FindNodePeerOffer: (peerkid: string, sdp?: string | undefined) => {
    rpc: "FindNodePeerOffer";
    sdp: string | undefined;
    peerkid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export {};
