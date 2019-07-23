import { Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
export default class FindNodeProxy {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    findnode: (data: {
        rpc: "FindNode";
        searchkid: string;
        except: string[];
    } & ID) => Promise<void>;
    findnodeanswer: (data: {
        rpc: "FindNodeAnswer";
        sdp: string;
        peerkid: string;
    } & ID) => Promise<void>;
}
export declare type Offer = {
    peerkid: string;
    sdp: string;
};
declare const FindNodeProxyOffer: (peers: Offer[]) => {
    rpc: "FindNodeProxyOffer";
    peers: Offer[];
};
export declare type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;
declare const FindNodeProxyOpen: (finderkid: string) => {
    rpc: "FindNodeProxyOpen";
    finderkid: string;
};
export declare type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;
declare const FindNodeProxyAnswer: (sdp: string, finderkid: string) => {
    rpc: "FindNodeProxyAnswer";
    sdp: string;
    finderkid: string;
};
export declare type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;
declare const FindNodeProxyAnswerError: () => {
    rpc: "FindNodeProxyAnswerError";
};
export declare type FindNodeProxyAnswerError = ReturnType<typeof FindNodeProxyAnswerError>;
export {};
