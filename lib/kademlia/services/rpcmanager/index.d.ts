import { Peer } from "../../modules/peer/base";
import Event from "rx.mini";
export declare type ID = {
    id: string;
};
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
    asObservable<T extends {
        rpc: string;
    }>(rpc: T["rpc"], listen: Peer): Event<T & ID>;
}
