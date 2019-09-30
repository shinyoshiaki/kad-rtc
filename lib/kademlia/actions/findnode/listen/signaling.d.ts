import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
export default class FindNodePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findNodeProxyOpen: (data: {
        type: "FindNodeProxyOpen";
        finderkid: string;
    } & ID) => Promise<void>;
    findNodeProxyAnswer: (data: {
        type: "FindNodeProxyAnswer";
        sdp: string;
        finderkid: string;
    }) => Promise<void>;
}
declare const FindNodePeerOffer: (peerkid: string, sdp?: string | undefined) => {
    type: "FindNodePeerOffer";
    sdp: string | undefined;
    peerkid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export {};
