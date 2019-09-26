import { Peer } from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
declare class ListenStore {
    private listen;
    private di;
    constructor(listen: Peer, di: DependencyInjection);
    store: (data: {
        rpc: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    } & ID) => void;
}
declare const OnStore: () => {
    rpc: "OnStore";
};
export declare type OnStore = ReturnType<typeof OnStore>;
export default function listenStore(peer: Peer, di: DependencyInjection): ListenStore;
export {};
