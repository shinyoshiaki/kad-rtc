import { Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
export default class FindValuePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findValueProxyOpen: (data: {
        rpc: "FindValueProxyOpen";
        finderkid: string;
    } & ID) => Promise<void>;
    findValueProxyAnswer: (data: {
        rpc: "FindValueProxyAnswer";
        sdp: string;
        finderkid: string;
    }) => Promise<void>;
}
declare const FindValuePeerOffer: (peerkid: string, sdp?: string | undefined) => {
    rpc: "FindValuePeerOffer";
    sdp: string | undefined;
    peerkid: string;
};
export declare type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
export {};
