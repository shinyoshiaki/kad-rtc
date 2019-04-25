"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _1 = tslib_1.__importDefault(require("."));
var FindNodePeerOffer = function (sdp, peerkid) {
    return { rpc: "FindNodePeerOffer", sdp: sdp, peerkid: peerkid };
};
var FindNodePeer = /** @class */ (function () {
    function FindNodePeer(module, listen, ktable) {
        var _this = this;
        this.module = module;
        this.listen = listen;
        this.ktable = ktable;
        this.signaling = {};
        var discon = listen.onRpc.subscribe(function (data) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (data.rpc) {
                    case "FindNodeProxyOpen":
                        this.findNodeProxyOpen(data);
                        break;
                    case "FindNodeProxyAnswer":
                        this.findNodeProxyAnswer(data);
                        break;
                }
                return [2 /*return*/];
            });
        }); });
        listen.onDisconnect.once(function () { return discon.unSubscribe(); });
    }
    FindNodePeer.prototype.findNodeProxyOpen = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var finderkid, peer, offer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        finderkid = data.finderkid;
                        peer = this.module(finderkid);
                        this.signaling[finderkid] = peer;
                        return [4 /*yield*/, peer.createOffer()];
                    case 1:
                        offer = _a.sent();
                        this.listen.rpc(FindNodePeerOffer(offer, this.ktable.kid));
                        return [2 /*return*/];
                }
            });
        });
    };
    FindNodePeer.prototype.findNodeProxyAnswer = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var finderkid, sdp, peer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        finderkid = data.finderkid, sdp = data.sdp;
                        peer = this.signaling[finderkid];
                        if (!peer)
                            return [2 /*return*/];
                        return [4 /*yield*/, peer.setAnswer(sdp)];
                    case 1:
                        _a.sent();
                        this.ktable.add(peer);
                        _1.default(this.module, peer, this.ktable);
                        return [2 /*return*/];
                }
            });
        });
    };
    return FindNodePeer;
}());
exports.default = FindNodePeer;
//# sourceMappingURL=peer.js.map