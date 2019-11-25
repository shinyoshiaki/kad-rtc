import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Signal } from "webrtc4me";
export default class FindNodePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findNodeProxyOpen: (data: {
        type: "FindNodeProxyOpen";
        finderKid: string;
    } & ID) => Promise<void>;
    findNodeProxyAnswer: (data: {
        type: "FindNodeProxyAnswer";
        sdp: Signal;
        finderKid: string;
    }) => Promise<void>;
}
declare const FindNodePeerOffer: (peerKid: string, sdp?: Signal | undefined) => {
    type: "FindNodePeerOffer";
    sdp: Signal | undefined;
    peerKid: string;
};
export declare type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
export {};
