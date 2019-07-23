import { Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Item } from "../../../modules/kvs/base";
import { ID } from "../../../services/rpcmanager";
export default class FindValueProxy {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    findvalue: (data: {
        rpc: "FindValue";
        key: string;
        except: string[];
    } & ID) => Promise<void>;
    findValueAnswer: (data: {
        rpc: "FindValueAnswer";
        sdp: string;
        peerkid: string;
    } & ID) => void;
}
declare const FindValueResult: (data: Partial<{
    item: Item;
    offers: Offer[];
}>) => {
    rpc: "FindValueResult";
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
    rpc: "FindValueProxyOpen";
    finderkid: string;
};
export declare type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;
declare const FindValueProxyAnswer: (sdp: string, finderkid: string) => {
    rpc: "FindValueProxyAnswer";
    sdp: string;
    finderkid: string;
};
export declare type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;
export {};
