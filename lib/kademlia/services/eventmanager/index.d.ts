import { ID, Peer, RPC } from "../../modules/peer/base";
import Event from "rx.mini";
import RpcManager from "../rpcmanager";
declare type Execute<T> = {
    rpc: T;
    peer: Peer;
};
export default class EventManager {
    rpcManager: RpcManager;
    event: Event<Execute<RPC>>;
    store: Event<Execute<{
        type: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    } & ID>>;
    findnode: Event<Execute<{
        type: "FindNode";
        searchkid: string;
        except: string[];
    } & ID>>;
    findvalue: Event<Execute<{
        type: "FindValue";
        key: string;
        except: string[];
    } & ID>>;
    constructor(rpcManager: RpcManager);
    listen(peer: Peer): void;
    private listenStore;
    private listenFindnode;
    private listenFindvalue;
    selectListen<T extends RPC>(rpcCode: T["type"]): Event<Execute<T>>;
}
export {};
