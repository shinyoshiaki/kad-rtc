"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const di_1 = require("./di");
const findnode_1 = tslib_1.__importDefault(require("./actions/findnode"));
const findvalue_1 = tslib_1.__importDefault(require("./actions/findvalue"));
const listeners_1 = require("./listeners");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const store_1 = tslib_1.__importDefault(require("./actions/store"));
const initialOptions = { timeout: 10000, kBucketSize: 20 };
class Kademlia {
    constructor(kid, modules, opt = { timeout: 10000 }) {
        this.kid = kid;
        this.findNode = (searchKid) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let target;
            for (let pre = ""; pre !== this.di.kTable.getHash(searchKid); pre = this.di.kTable.getHash(searchKid)) {
                target = yield findnode_1.default(searchKid, this.di);
                if (target)
                    break;
            }
            return target;
        });
        this.store = (value, msg) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const key = typeof value === "string" ? sha1_1.default(value) : sha1_1.default(Buffer.from(value));
            const res = yield store_1.default(this.di, key, value, msg);
            return res;
        });
        this.findValue = (key, opt) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kvs } = this.di.modules;
            const res = yield findvalue_1.default(key, this.di, opt);
            if (res && res.item) {
                kvs.set(key, res.item.value, res.item.msg || "");
            }
            return res;
        });
        this.add = (connect) => {
            listeners_1.listeners(connect, this.di);
        };
        opt = Object.assign(Object.assign({}, initialOptions), opt);
        this.di = di_1.dependencyInjection(kid, modules, opt);
    }
    dispose() {
        const { kTable } = this.di;
        kTable.allPeers.forEach(peer => peer.disconnect());
    }
}
exports.default = Kademlia;
//# sourceMappingURL=kademlia.js.map