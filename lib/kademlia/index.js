"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("./actions/findnode"));
const di_1 = require("./di");
const store_1 = tslib_1.__importDefault(require("./actions/store"));
const findvalue_1 = tslib_1.__importDefault(require("./actions/findvalue"));
class Kademlia {
    constructor(kid, peerModule, opt = {}) {
        this.kid = kid;
        this.di = di_1.dependencyInjection(kid, peerModule, opt);
    }
    findNode(searchkid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let target;
            for (let pre = ""; pre !== this.di.kTable.getHash(searchkid); pre = this.di.kTable.getHash(searchkid)) {
                target = yield findnode_1.default(searchkid, this.di);
                if (target)
                    break;
            }
            return target;
        });
    }
    store(value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield store_1.default(value, this.di);
        });
    }
    findValue(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield findvalue_1.default(key, this.di);
            return res;
        });
    }
    add(peer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable } = this.di;
            kTable.add(peer);
            yield findnode_1.default(this.kid, this.di);
        });
    }
}
exports.default = Kademlia;
//# sourceMappingURL=index.js.map