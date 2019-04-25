import Event from "../../../utill/event";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer {
    kid: string;
    onRpc: Event<any>;
    onDisconnect: Event<{}>;
    onConnect: Event<{}>;
    constructor(kid: string);
    rpc: (data: {
        rpc: string;
    }) => Event<any>;
    createOffer: () => Promise<any>;
    setOffer: (sdp: any) => Promise<any>;
    setAnswer: (sdp: any) => Promise<any>;
    disconnect: () => void;
}
