import Peer from "../../../modules/peer";
import { DependencyInjection } from "../../../di";
import { FindValueProxyOpen, FindValueProxyAnswer } from "./proxy";
declare const FindValuePeerOffer: (sdp: any, peerkid: string) => {
    rpc: "FindValuePeerOffer";
    sdp: any;
    peerkid: string;
};
export declare type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
export default class FindValuePeer {
    private listen;
    private di;
    signaling: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findValueProxyOpen(data: FindValueProxyOpen): Promise<void>;
    findValueProxyAnswer(data: FindValueProxyAnswer): Promise<void>;
}
export {};
