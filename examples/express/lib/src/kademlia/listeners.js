"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listen_1 = tslib_1.__importDefault(require("./actions/findnode/listen"));
const listen_2 = tslib_1.__importDefault(require("./actions/store/listen"));
const listen_3 = tslib_1.__importDefault(require("./actions/findvalue/listen"));
function listeners(peer, di) {
    listen_2.default(peer, di);
    listen_1.default(peer, di);
    listen_3.default(peer, di);
}
exports.listeners = listeners;
//# sourceMappingURL=listeners.js.map