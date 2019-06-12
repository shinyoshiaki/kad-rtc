import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { FindValueProxyOpen, FindValueProxyAnswer } from "./proxy";
import { ID } from "../../../services/rpcmanager";
declare const FindValuePeerOffer: (peerkid: string, sdp?: object | undefined) => {
    rpc: "FindValuePeerOffer";
    sdp: object | undefined;
    peerkid: string;
};
export declare type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
export default class FindValuePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findValueProxyOpen(data: FindValueProxyOpen & ID): Promise<void>;
    findValueProxyAnswer(data: FindValueProxyAnswer): Promise<void>;
}
export {};
