"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const uuid_1 = tslib_1.__importDefault(require("../../../utill/uuid"));
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class RpcManager {
    constructor() {
        this.uuid = new uuid_1.default();
    }
    getWait(peer, rpc) {
        this.uuid.setPrefix(peer.kid);
        const id = this.uuid.get() + rpc.rpc;
        const event = new rx_mini_1.default();
        const onRpc = peer.onRpc.subscribe((v) => {
            if (v.id === id) {
                event.execute(v);
                onRpc.unSubscribe();
            }
        });
        peer.rpc(Object.assign({}, rpc, { id }));
        return event.asPromise;
    }
    run(peer, rpc) {
        this.uuid.setPrefix(peer.kid);
        const id = this.uuid.get();
        peer.rpc(Object.assign({}, rpc, { id }));
    }
}
exports.default = RpcManager;
//# sourceMappingURL=index.js.map