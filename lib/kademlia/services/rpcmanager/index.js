"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const uuid_1 = tslib_1.__importDefault(require("../../../utill/uuid"));
class RpcManager {
    constructor() {
        this.uuid = new uuid_1.default();
    }
    getWait(peer, rpc) {
        this.uuid.setPrefix(peer.kid);
        const id = this.uuid.get() + rpc.type;
        const event = new rx_mini_1.default();
        const { unSubscribe } = peer.onRpc.subscribe(v => {
            if (v.id === id) {
                event.execute(v);
                unSubscribe();
            }
        });
        peer.rpc(Object.assign(Object.assign({}, rpc), { id }));
        return event.asPromise;
    }
    run(peer, rpc) {
        this.uuid.setPrefix(peer.kid);
        const id = this.uuid.get();
        peer.rpc(Object.assign(Object.assign({}, rpc), { id }));
    }
    asObservable(type, listen) {
        const event = new rx_mini_1.default();
        const { unSubscribe } = listen.onRpc.subscribe(data => {
            if (data.type === type) {
                event.execute(data);
            }
        });
        listen.onDisconnect.once(unSubscribe);
        return event;
    }
}
exports.default = RpcManager;
//# sourceMappingURL=index.js.map