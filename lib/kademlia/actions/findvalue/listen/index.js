"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const peer_1 = tslib_1.__importDefault(require("./peer"));
const proxy_1 = tslib_1.__importDefault(require("./proxy"));
function listenFindValue(peer, di) {
    new peer_1.default(peer, di);
    new proxy_1.default(peer, di);
}
exports.default = listenFindValue;
//# sourceMappingURL=index.js.map