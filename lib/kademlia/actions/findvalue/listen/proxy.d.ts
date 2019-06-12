import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { FindValue, FindValueAnswer } from "..";
import { Item } from "../../../modules/kvs/base";
import { ID } from "../../../services/rpcmanager";
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
    sdp: any;
};
export declare type FindValueResult = ReturnType<typeof FindValueResult>;
declare const FindValueProxyOpen: (finderkid: string) => {
    rpc: "FindValueProxyOpen";
    finderkid: string;
};
export declare type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;
declare const FindValueProxyAnswer: (sdp: any, finderkid: string) => {
    rpc: "FindValueProxyAnswer";
    sdp: any;
    finderkid: string;
};
export declare type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;
export default class FindValueProxy {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    findvalue(data: FindValue & ID): Promise<void>;
    findValueAnswer(data: FindValueAnswer & ID): Promise<void>;
}
export {};
