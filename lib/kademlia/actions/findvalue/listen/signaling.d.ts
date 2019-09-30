import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
export default class FindValuePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findValueProxyOpen: (data: {
        type: "FindValueProxyOpen";
        finderkid: string;
    } & ID) => Promise<void>;
    findValueProxyAnswer: (data: {
        type: "FindValueProxyAnswer";
        sdp: string;
        finderkid: string;
    }) => Promise<void>;
}
declare const FindValuePeerOffer: (peerkid: string, sdp?: string | undefined) => {
    type: "FindValuePeerOffer";
    sdp: string | undefined;
    peerkid: string;
};
export declare type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
export {};
