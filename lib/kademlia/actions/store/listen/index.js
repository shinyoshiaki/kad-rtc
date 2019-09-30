"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ListenStore {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.store = (data) => {
            const { kvs } = this.di.modules;
            const { key, value, id, msg } = data;
            kvs.set(key, value, msg);
            this.listen.rpc(Object.assign(Object.assign({}, OnStore()), { id }));
        };
        const { eventManager } = di;
        eventManager.store.subscribe(({ res }) => this.store(res));
    }
}
const OnStore = () => {
    return { rpc: "OnStore" };
};
function listenStore(peer, di) {
    return new ListenStore(peer, di);
}
exports.default = listenStore;
//# sourceMappingURL=index.js.map