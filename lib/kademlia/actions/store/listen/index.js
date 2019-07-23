"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function listenStore(peer, di) {
    return new ListenStore(peer, di);
}
exports.default = listenStore;
class ListenStore {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.store = (data) => {
            const { kvs } = this.di.modules;
            const { key, value, id, msg } = data;
            kvs.set(key, value, msg);
            this.listen.rpc(Object.assign({}, OnStore(), { id }));
        };
        const { rpcManager } = di;
        rpcManager.asObservable("Store", listen).subscribe(this.store);
    }
}
const OnStore = () => {
    return { rpc: "OnStore" };
};
//# sourceMappingURL=index.js.map