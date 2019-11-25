"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("../findnode"));
function store(di, key, value, msg) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, jobSystem } = di;
        const { timeout } = di.opt;
        const { kvs } = di.modules;
        kvs.set(key, value, msg);
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield findnode_1.default(key, di);
        }
        const peers = di.kTable.findNode(key);
        const item = Store(key, value, msg);
        const onStore = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield rpcManager
                .getWait(peer, item)(timeout)
                .catch(() => { });
            // TODO error handling
        });
        yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield jobSystem.add(onStore, [peer]); })));
        return { item, peers };
    });
}
exports.default = store;
const Store = (key, value, msg) => ({
    type: "Store",
    key,
    value,
    msg
});
//# sourceMappingURL=index.js.map