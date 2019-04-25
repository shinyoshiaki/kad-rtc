import Base from ".";
import Event from "../../../utill/event";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer implements Base {
    kid: string;
    private type;
    onRpc: Event<any>;
    onDisconnect: Event<{}>;
    onConnect: Event<{}>;
    onData: Event<any>;
    send: Event<any> | undefined;
    constructor(kid: string);
    rpc: (send: {
        rpc: string;
    }) => Event<any>;
    createOffer: () => Promise<Event<any>>;
    setOffer: (sdp: any) => Promise<{
        send: Event<any>;
        connect: Event<{}>;
    }>;
    setAnswer: (sdp: any) => Promise<boolean>;
    disconnect: () => void;
}
