import { ID, Peer, RPC } from "../../modules/peer/base";
import Event from "rx.mini";
import RpcManager from "../rpcmanager";
declare type WithPeer<T> = {
    rpc: T;
    peer: Peer;
};
export default class EventManager {
    rpcManager: RpcManager;
    event: Event<WithPeer<RPC>>;
    store: Event<WithPeer<{
        type: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    } & ID>>;
    findnode: Event<WithPeer<{
        type: "FindNode";
        searchkid: string;
        except: string[];
    } & ID>>;
    findvalue: Event<WithPeer<{
        type: "FindValue";
        key: string;
        except: string[];
    } & ID>>;
    constructor(rpcManager: RpcManager);
    listen(peer: Peer): void;
    private listenStore;
    private listenFindnode;
    private listenFindvalue;
    selectListen<T extends RPC>(rpcCode: T["type"]): Event<WithPeer<T>>;
}
export {};
