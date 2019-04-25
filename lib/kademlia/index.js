"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ktable_1 = tslib_1.__importDefault(require("./ktable"));
var sha1_1 = tslib_1.__importDefault(require("sha1"));
var findnode_1 = tslib_1.__importDefault(require("./actions/findnode"));
var Kademlia = /** @class */ (function () {
    function Kademlia(module, opt) {
        if (opt === void 0) { opt = {}; }
        this.module = module;
        this.kid = sha1_1.default(Math.random().toString()).toString();
        var kid = this.kid;
        this.kTable = new ktable_1.default(kid, opt);
    }
    Kademlia.prototype.findNode = function (searchkid) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, findnode_1.default(this.module, searchkid, this.kTable)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Kademlia;
}());
exports.default = Kademlia;
//# sourceMappingURL=index.js.map