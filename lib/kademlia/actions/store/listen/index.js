"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
        const discon = listen.onRpc.subscribe((data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (data.rpc) {
                case "store":
                    this.store(data);
                    break;
            }
        }));
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    store(data) {
        const { key, value } = data;
        const { kvs } = this.di;
        kvs.set(key, value);
        this.listen.rpc(OnStore());
    }
}
//# sourceMappingURL=index.js.map