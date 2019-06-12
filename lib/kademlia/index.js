"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findnode_1 = tslib_1.__importDefault(require("./actions/findnode"));
const di_1 = require("./di");
const store_1 = tslib_1.__importDefault(require("./actions/store"));
const findvalue_1 = tslib_1.__importDefault(require("./actions/findvalue"));
const listeners_1 = require("./listeners");
class Kademlia {
    constructor(kid, modules, opt = {}) {
        this.kid = kid;
        this.opt = opt;
        this.di = di_1.dependencyInjection(kid, modules, opt);
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
    store(key, value, msg) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield store_1.default(this.di, key, value, msg);
        });
    }
    findValue(key) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield findvalue_1.default(key, this.di);
            return res;
        });
    }
    add(connect, opt = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable } = this.di;
            const { notfind } = opt;
            kTable.add(connect);
            listeners_1.listeners(connect, this.di);
            if (!notfind) {
                yield new Promise(r => setTimeout(r, 1000));
                yield findnode_1.default(this.kid, this.di);
            }
        });
    }
}
exports.default = Kademlia;
//# sourceMappingURL=index.js.map