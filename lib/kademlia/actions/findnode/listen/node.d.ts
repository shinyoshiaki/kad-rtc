import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Signal } from "webrtc4me";
export default class FindNodeProxy {
    private listen;
    private di;
    timeout: number;
    constructor(listen: Peer, di: DependencyInjection);
    findnode: (data: {
        type: "FindNode";
        searchKid: string;
        except: string[];
    } & ID) => Promise<void>;
    findNodeAnswer: (data: {
        type: "FindNodeAnswer";
        sdp: Signal;
        peerKid: string;
    } & ID) => Promise<void>;
}
export declare type OfferPayload = {
    peerKid: string;
    sdp: Signal;
};
declare const FindNodeProxyOffer: (peers: OfferPayload[]) => {
    type: "FindNodeProxyOffer";
    peers: OfferPayload[];
};
export declare type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;
declare const FindNodeProxyOpen: (finderKid: string) => {
    type: "FindNodeProxyOpen";
    finderKid: string;
};
export declare type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;
declare const FindNodeProxyAnswer: (sdp: Signal, finderKid: string) => {
    type: "FindNodeProxyAnswer";
    sdp: Signal;
    finderKid: string;
};
export declare type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;
declare const FindNodeProxyAnswerError: () => {
    type: "FindNodeProxyAnswerError";
};
export declare type FindNodeProxyAnswerError = ReturnType<typeof FindNodeProxyAnswerError>;
export {};
