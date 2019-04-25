"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var event_1 = tslib_1.__importDefault(require("../../../utill/event"));
exports.PeerModule = function (kid) { return new Peer(kid); };
var Peer = /** @class */ (function () {
    function Peer(kid) {
        var _this = this;
        this.kid = kid;
        this.onRpc = new event_1.default();
        this.onDisconnect = new event_1.default();
        this.onConnect = new event_1.default();
        this.rpc = function (data) { return new event_1.default(); };
        this.createOffer = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        this.setOffer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        this.setAnswer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        this.disconnect = function () { };
    }
    return Peer;
}());
exports.default = Peer;
//# sourceMappingURL=index.js.map