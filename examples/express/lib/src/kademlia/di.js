"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("./ktable"));
exports.dependencyInjection = (kid, modules, opt = {}) => {
    return { kTable: new ktable_1.default(kid, opt), modules };
};
//# sourceMappingURL=di.js.map