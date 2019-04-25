"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var peer_1 = tslib_1.__importDefault(require("./peer"));
var proxy_1 = tslib_1.__importDefault(require("./proxy"));
function listenFindnode(module, peer, ktable) {
    new proxy_1.default(peer, ktable);
    new peer_1.default(module, peer, ktable);
}
exports.default = listenFindnode;
//# sourceMappingURL=index.js.map