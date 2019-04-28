import Base from ".";
import Event from "../../../utill/event";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer implements Base {
    kid: string;
    private type;
    private onData;
    private send;
    onRpc: Event<any>;
    onDisconnect: Event<{}>;
    onConnect: Event<{}>;
    constructor(kid: string);
    rpc: (send: {
        rpc: string;
    }) => void;
    eventRpc: (rpc: string) => Event<any>;
    createOffer: () => Promise<Event<any>>;
    setOffer: (sdp: Event<any>) => Promise<{
        send: Event<any>;
        connect: Event<{}>;
    }>;
    setAnswer: (sdp: {
        send: Event<any>;
        connect: Event<{}>;
    }) => Promise<boolean>;
    disconnect: () => void;
}
