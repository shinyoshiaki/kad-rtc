"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
exports.abHash = (ab) => sha1_1.default(Buffer.from(ab)).toString();
exports.jsonHash = (obj) => sha1_1.default(JSON.stringify(obj)).toString();
//# sourceMappingURL=crypto.js.map