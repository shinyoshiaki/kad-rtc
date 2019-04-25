"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("./ktable"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const findnode_1 = tslib_1.__importDefault(require("./actions/findnode"));
class Kademlia {
    constructor(module, opt = {}) {
        this.module = module;
        this.kid = sha1_1.default(Math.random().toString()).toString();
        const { kid } = this;
        this.kTable = new ktable_1.default(kid, opt);
    }
    findNode(searchkid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield findnode_1.default(this.module, searchkid, this.kTable);
        });
    }
}
exports.default = Kademlia;
//# sourceMappingURL=index.js.map