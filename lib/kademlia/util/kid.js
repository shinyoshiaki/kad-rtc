"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
function genKid(seed) {
    const str = seed || Math.random().toString();
    return sha1_1.default(str).toString();
}
exports.default = genKid;
//# sourceMappingURL=kid.js.map