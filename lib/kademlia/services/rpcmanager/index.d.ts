import Peer from "../../modules/peer/base";
export default class RpcManager {
    private uuid;
    getWait<T extends {
        rpc: string;
        [key: string]: unknown;
    }>(peer: Peer, rpc: {
        rpc: string;
        [key: string]: any;
    }): (timelimit?: number | undefined) => Promise<T>;
    run(peer: Peer, rpc: {
        rpc: string;
        [key: string]: any;
    }): void;
}
