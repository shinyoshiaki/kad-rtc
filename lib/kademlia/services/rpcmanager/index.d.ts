import { ID, Peer, RPCBase } from "../../modules/peer/base";
import Event from "rx.mini";
export default class RpcManager {
    private uuid;
    getWait: <T extends RPCBase>(peer: Peer, rpc: RPCBase) => (timelimit?: number | undefined) => Promise<T>;
    run: (peer: Peer, rpc: {
        [key: string]: any;
        type: string;
    }) => void;
    asObservable: <T extends RPCBase>(type: T["type"], listen: Peer) => Event<T & ID>;
}
