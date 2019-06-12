import { Store } from "..";
import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
declare const OnStore: () => {
    rpc: "OnStore";
};
export declare type OnStore = ReturnType<typeof OnStore>;
export default function listenStore(peer: Peer, di: DependencyInjection): ListenStore;
declare class ListenStore {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    store(data: Store & ID): void;
}
export {};
