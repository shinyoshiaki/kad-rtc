/// <reference types="socket.io" />
import Kademlia from "../../kademlia";
import Peer from "../../kademlia/modules/peer/base";
import Event from "rx.mini";
import { Option } from "../../kademlia/ktable";
declare type Options = {
    port: number;
    target?: {
        url: string;
        port: number;
    };
    kadOption?: Partial<Option>;
};
export default class PortalNode {
    private opt;
    kid: string;
    kademlia: Kademlia;
    peers: {
        [key: string]: Peer;
    };
    onConnect: Event<{}>;
    io: SocketIO.Server | undefined;
    constructor(opt: Options);
    private offer;
    private answer;
    close(): void;
}
export {};
