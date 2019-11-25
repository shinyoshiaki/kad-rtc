import { ID, Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { Signal } from "webrtc4me";
export default class FindValuePeer {
    private listen;
    private di;
    candidates: {
        [key: string]: Peer;
    };
    constructor(listen: Peer, di: DependencyInjection);
    findValueProxyOpen: (data: {
        type: "FindValueProxyOpen";
        finderKid: string;
    } & ID) => Promise<void>;
    findValueProxyAnswer: (data: {
        type: "FindValueProxyAnswer";
        sdp: Signal;
        finderKid: string;
    }) => Promise<void>;
}
declare const FindValuePeerOffer: (peerKid: string, sdp?: Signal | undefined) => {
    type: "FindValuePeerOffer";
    sdp: Signal | undefined;
    peerKid: string;
};
export declare type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
export {};
