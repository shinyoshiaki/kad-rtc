import Peer from "../../../modules/peer";
import { DependencyInjection } from "../../../di";
import { FindValue, FindValueAnswer } from "..";
declare const FindValueResult: (data: Partial<{
    value: string;
    offers: {
        peerkid: string;
        sdp: any;
    }[];
}>) => {
    rpc: "FindValueResult";
    data: Partial<{
        value: string;
        offers: {
            peerkid: string;
            sdp: any;
        }[];
    }>;
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
    findvalue(data: FindValue): Promise<void>;
    findValueAnswer(data: FindValueAnswer): Promise<void>;
}
export {};
