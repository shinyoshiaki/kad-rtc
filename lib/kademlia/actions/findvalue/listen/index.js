"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const signaling_1 = tslib_1.__importDefault(require("./signaling"));
const node_1 = tslib_1.__importDefault(require("./node"));
function listenFindValue(peer, di) {
    new signaling_1.default(peer, di);
    new node_1.default(peer, di);
}
exports.default = listenFindValue;
//# sourceMappingURL=index.js.map