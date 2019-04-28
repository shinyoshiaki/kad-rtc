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
        const key = sha1_1.default(value).toString();
        for (let pre = "", i = 0; i < di.kTable.kBucketSize; i++) {
            const res = yield findnode_1.default(key, di);
            if (pre === res.hash) {
                break;
            }
            pre = res.hash;
        }
        const peers = di.kTable.findNode(key);
        for (let peer of peers) {
            peer.rpc(Store(key, value));
            yield peer.eventRpc("OnStore").asPromise();
        }
        di.kvs.set(key, value);
    });
}
exports.default = store;
//# sourceMappingURL=index.js.map