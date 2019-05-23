import Base, { RPC } from "./base";
import Event from "rx.mini";
export declare const PeerModule: (kid: string) => Peer;
export default class Peer implements Base {
    kid: string;
    private type;
    private peer;
    onRpc: Event<RPC>;
    onDisconnect: any;
    onConnect: Event<boolean>;
    constructor(kid: string);
    parseRPC: (data: ArrayBuffer) => RPC | undefined;
    rpc: (send: RPC) => void;
    eventRpc: (rpc: string, id: string) => Event<any>;
    createOffer: () => Promise<any>;
    setOffer: (offer: any) => Promise<any>;
    setAnswer: (answer: any) => Promise<boolean>;
    disconnect: () => void;
}
