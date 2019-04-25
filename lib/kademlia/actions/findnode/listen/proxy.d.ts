import Peer from "../../../modules/peer";
import { FindNode, FindNodeAnswer } from "..";
import Ktable from "../../../ktable";
declare const FindNodeProxyOffer: (peers: {
    peerkid: string;
    sdp: any;
}[]) => {
    rpc: "FindNodeProxyOffer";
    peers: {
        peerkid: string;
        sdp: any;
    }[];
};
export declare type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;
declare const FindNodeProxyOpen: (finderkid: string) => {
    rpc: "FindNodeProxyOpen";
    finderkid: string;
};
export declare type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;
declare const FindNodeProxyAnswer: (sdp: any, finderkid: string) => {
    rpc: "FindNodeProxyAnswer";
    sdp: any;
    finderkid: string;
};
export declare type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;
export default class FindNodeProxy {
    private listen;
    private ktable;
    constructor(listen: Peer, ktable: Ktable);
    findnode(data: FindNode): Promise<void>;
    findnodeanswer(data: FindNodeAnswer): Promise<void>;
}
export {};