"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("./ktable"));
const base_1 = tslib_1.__importDefault(require("./modules/kvs/base"));
exports.dependencyInjection = (kid, peerModule, opt = {}) => {
    return { kTable: new ktable_1.default(kid, opt), kvs: new base_1.default(), peerModule };
};
//# sourceMappingURL=di.js.map