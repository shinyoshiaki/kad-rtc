"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OnStore = () => {
    return { rpc: "OnStore" };
};
function listenStore(peer, di) {
    return new ListenStore(peer, di);
}
exports.default = listenStore;
class ListenStore {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        const onRpc = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "store":
                    this.store(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => onRpc.unSubscribe());
    }
    store(data) {
        const { kvs } = this.di.modules;
        const { key, value, id, msg } = data;
        if (!msg)
            console.warn(data);
        kvs.set(key, value, msg);
        this.listen.rpc(Object.assign({}, OnStore(), { id }));
    }
}
//# sourceMappingURL=index.js.map