import Event from "rx.mini";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer {
    kid: string;
    onRpc: Event<any>;
    onDisconnect: Event<{}>;
    onConnect: Event<boolean>;
    constructor(kid: string);
    rpc: (data: {
        rpc: string;
    }) => void;
    eventRpc: <T extends {
        rpc: string;
    }>(rpc: T["rpc"]) => Event<T>;
    createOffer: () => Promise<any>;
    setOffer: (sdp: any) => Promise<any>;
    setAnswer: (sdp: any) => Promise<any>;
    disconnect: () => void;
}
