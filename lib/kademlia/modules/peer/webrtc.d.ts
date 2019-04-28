import Base from ".";
import Event from "../../../utill/event";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer implements Base {
    kid: string;
    private type;
    private peer;
    onRpc: Event<any>;
    onDisconnect: any;
    onConnect: any;
    constructor(kid: string);
    rpc: (send: {
        rpc: string;
    }) => void;
    eventRpc: (rpc: string) => Event<any>;
    createOffer: () => Promise<any>;
    setOffer: (offer: any) => Promise<any>;
    setAnswer: (answer: any) => Promise<boolean>;
    disconnect: () => void;
}
