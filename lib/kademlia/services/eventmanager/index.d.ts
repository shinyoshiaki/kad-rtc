import RpcManager, { ID } from "../rpcmanager";
import Event from "rx.mini";
import { Peer } from "../../modules/peer/base";
export default class EventManager {
    rpcManager: RpcManager;
    store: Event<{
        rpc: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    } & ID>;
    findnode: Event<{
        rpc: "FindNode";
        searchkid: string;
        except: string[];
    } & ID>;
    findvalue: Event<{
        rpc: "FindValue";
        key: string;
        except: string[];
    } & ID>;
    constructor(rpcManager: RpcManager);
    listen(peer: Peer): void;
    private listenStore;
    private listenFindnode;
    private listenFindvalue;
}
