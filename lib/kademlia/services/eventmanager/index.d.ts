import RpcManager, { ID } from "../rpcmanager";
import Event from "rx.mini";
import { Peer } from "../../modules/peer/base";
declare type Execute<T> = {
    res: T;
    peer: Peer;
};
export default class EventManager {
    rpcManager: RpcManager;
    store: Event<Execute<{
        rpc: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    } & ID>>;
    findnode: Event<Execute<{
        rpc: "FindNode";
        searchkid: string;
        except: string[];
    } & ID>>;
    findvalue: Event<Execute<{
        rpc: "FindValue";
        key: string;
        except: string[];
    } & ID>>;
    constructor(rpcManager: RpcManager);
    listen(peer: Peer): void;
    private listenStore;
    private listenFindnode;
    private listenFindvalue;
}
export {};
