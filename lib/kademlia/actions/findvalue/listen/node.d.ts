import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Item } from "../../../modules/kvs/base";
export default class FindValueProxy {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    findvalue: (data: {
        type: "FindValue";
        key: string;
        except: string[];
    } & ID) => Promise<void>;
    findValueAnswer: (data: {
        type: "FindValueAnswer";
        sdp: string;
        peerkid: string;
    } & ID) => void;
}
declare const FindValueResult: (data: Partial<{
    item: Item;
    offers: Offer[];
}>) => {
    type: "FindValueResult";
    data: Partial<{
        item: Item;
        offers: Offer[];
    }>;
};
export declare type Offer = {
    peerkid: string;
    sdp: string;
};
export declare type FindValueResult = ReturnType<typeof FindValueResult>;
declare const FindValueProxyOpen: (finderkid: string) => {
    type: "FindValueProxyOpen";
    finderkid: string;
};
export declare type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;
declare const FindValueProxyAnswer: (sdp: string, finderkid: string) => {
    type: "FindValueProxyAnswer";
    sdp: string;
    finderkid: string;
};
export declare type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;
export {};
