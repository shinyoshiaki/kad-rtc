import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
export default class FindNodeProxy {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    findnode: (data: {
        type: "FindNode";
        searchkid: string;
        except: string[];
    } & ID) => Promise<void>;
    findnodeanswer: (data: {
        type: "FindNodeAnswer";
        sdp: string;
        peerkid: string;
    } & ID) => Promise<void>;
}
export declare type Offer = {
    peerkid: string;
    sdp: string;
};
declare const FindNodeProxyOffer: (peers: Offer[]) => {
    type: "FindNodeProxyOffer";
    peers: Offer[];
};
export declare type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;
declare const FindNodeProxyOpen: (finderkid: string) => {
    type: "FindNodeProxyOpen";
    finderkid: string;
};
export declare type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;
declare const FindNodeProxyAnswer: (sdp: string, finderkid: string) => {
    type: "FindNodeProxyAnswer";
    sdp: string;
    finderkid: string;
};
export declare type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;
declare const FindNodeProxyAnswerError: () => {
    type: "FindNodeProxyAnswerError";
};
export declare type FindNodeProxyAnswerError = ReturnType<typeof FindNodeProxyAnswerError>;
export {};
