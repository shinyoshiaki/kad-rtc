"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("../findnode"));
const const_1 = require("../../const");
const Store = (key, value) => {
    return { rpc: "store", key, value };
};
function store(key, value, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, jobSystem } = di;
        const { kvs } = di.modules;
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield findnode_1.default(key, di);
        }
        const peers = di.kTable.findNode(key);
        const onStore = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const wait = rpcManager.getWait(peer, Store(key, value));
            yield wait(const_1.timeout).catch(() => { });
        });
        yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield jobSystem.add(onStore, [peer]); })));
        kvs.set(key, value);
        return key;
    });
}
exports.default = store;
//# sourceMappingURL=index.js.map