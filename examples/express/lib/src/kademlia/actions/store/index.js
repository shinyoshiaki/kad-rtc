"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("../findnode"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const Store = (key, value) => {
    return { rpc: "store", key, value };
};
function store(value, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable } = di;
        const { kvs } = di.modules;
        const key = sha1_1.default(value).toString();
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield findnode_1.default(key, di);
        }
        const peers = di.kTable.findNode(key);
        const onStore = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            peer.rpc(Store(key, value));
            yield peer
                .eventRpc("OnStore")
                .asPromise(3333)
                .catch(console.error);
        });
        yield Promise.all(peers.map(peer => onStore(peer)));
        kvs.set(key, value);
        return key;
    });
}
exports.default = store;
//# sourceMappingURL=index.js.map