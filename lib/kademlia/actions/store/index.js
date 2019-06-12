"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("../findnode"));
const const_1 = require("../../const");
const Store = (key, value, msg) => ({
    rpc: "store",
    key,
    value,
    msg
});
function store(di, key, value, msg) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, jobSystem } = di;
        const { kvs } = di.modules;
        kvs.set(key, value, msg);
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield findnode_1.default(key, di);
        }
        const peers = di.kTable.findNode(key);
        const item = Store(key, value, msg);
        const onStore = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wait = rpcManager.getWait(peer, item);
            yield wait(const_1.timeout).catch(() => { });
        });
        yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield jobSystem.add(onStore, [peer]); })));
        return item;
    });
}
exports.default = store;
//# sourceMappingURL=index.js.map