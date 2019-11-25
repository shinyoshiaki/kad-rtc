import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Item } from "../../../modules/kvs/base";
import { Signal } from "webrtc4me";
export default class FindValueProxy {
    private listen;
    private di;
    timeout: number;
    constructor(listen: Peer, di: DependencyInjection);
    findvalue: (data: {
        type: "FindValue";
        key: string;
        except: string[];
    } & ID) => Promise<void>;
    findValueAnswer: (data: {
        type: "FindValueAnswer";
        sdp: Signal;
        peerKid: string;
    } & ID) => void;
}
declare const FindValueResult: (value: Partial<{
    item: Item;
    offers: OfferPayload[];
}>) => {
    type: "FindValueResult";
    value: Partial<{
        item: Item;
        offers: OfferPayload[];
    }>;
};
export declare type OfferPayload = {
    peerKid: string;
    sdp: Signal;
};
export declare type FindValueResult = ReturnType<typeof FindValueResult>;
declare const FindValueProxyOpen: (finderKid: string) => {
    type: "FindValueProxyOpen";
    finderKid: string;
};
export declare type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;
declare const FindValueProxyAnswer: (sdp: Signal, finderKid: string) => {
    type: "FindValueProxyAnswer";
    sdp: Signal;
    finderKid: string;
};
export declare type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;
export {};
