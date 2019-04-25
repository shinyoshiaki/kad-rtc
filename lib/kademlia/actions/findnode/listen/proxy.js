"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FindNodeProxyOffer = function (peers) {
    return { rpc: "FindNodeProxyOffer", peers: peers };
};
var FindNodeProxyOpen = function (finderkid) {
    return { rpc: "FindNodeProxyOpen", finderkid: finderkid };
};
var FindNodeProxyAnswer = function (sdp, finderkid) {
    return { rpc: "FindNodeProxyAnswer", sdp: sdp, finderkid: finderkid };
};
var FindNodeProxy = /** @class */ (function () {
    function FindNodeProxy(listen, ktable) {
        var _this = this;
        this.listen = listen;
        this.ktable = ktable;
        var discon = listen.onRpc.subscribe(function (data) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (data.rpc) {
                    case "findnode":
                        this.findnode(data);
                        break;
                    case "findnodeanswer":
                        this.findnodeanswer(data);
                        break;
                }
                return [2 /*return*/];
            });
        }); });
        listen.onDisconnect.once(function () { return discon.unSubscribe(); });
    }
    FindNodeProxy.prototype.findnode = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var searchkid, except, peers, offers, _i, peers_1, peer, rpc, res, peerkid, sdp;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchkid = data.searchkid, except = data.except;
                        peers = this.ktable.findNode(searchkid);
                        offers = [];
                        _i = 0, peers_1 = peers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < peers_1.length)) return [3 /*break*/, 4];
                        peer = peers_1[_i];
                        if (peer.kid === this.listen.kid)
                            return [3 /*break*/, 3];
                        if (except.includes(peer.kid))
                            return [3 /*break*/, 3];
                        rpc = peer.rpc(FindNodeProxyOpen(this.listen.kid));
                        return [4 /*yield*/, rpc.asPromise()];
                    case 2:
                        res = _a.sent();
                        if (res.rpc === "FindNodePeerOffer") {
                            peerkid = res.peerkid, sdp = res.sdp;
                            offers.push({ peerkid: peerkid, sdp: sdp });
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.listen.rpc(FindNodeProxyOffer(offers));
                        return [2 /*return*/];
                }
            });
        });
    };
    FindNodeProxy.prototype.findnodeanswer = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sdp, peerkid, peer;
            return tslib_1.__generator(this, function (_a) {
                sdp = data.sdp, peerkid = data.peerkid;
                peer = this.ktable.getPeer(peerkid);
                if (!peer)
                    return [2 /*return*/];
                peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
                return [2 /*return*/];
            });
        });
    };
    return FindNodeProxy;
}());
exports.default = FindNodeProxy;
//# sourceMappingURL=proxy.js.map