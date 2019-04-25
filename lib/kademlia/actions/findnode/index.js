"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var listen_1 = tslib_1.__importDefault(require("./listen"));
var FindNode = function (searchkid, except) {
    return { rpc: "findnode", searchkid: searchkid, except: except };
};
var FindNodeAnswer = function (sdp, peerkid) {
    return { rpc: "findnodeanswer", sdp: sdp, peerkid: peerkid };
};
function findNode(module, searchkid, ktable) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _i, _a, peer, except, rpc, res, offers, _b, offers_1, offer, peerkid, sdp, connect, answer;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, _a = ktable.findNode(searchkid);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    peer = _a[_i];
                    except = ktable.allPeers.map(function (item) { return item.kid; });
                    rpc = peer.rpc(FindNode(searchkid, except));
                    return [4 /*yield*/, rpc.asPromise()];
                case 2:
                    res = _c.sent();
                    if (!(res.rpc === "FindNodeProxyOffer")) return [3 /*break*/, 7];
                    offers = res.peers;
                    if (offers.length === 0)
                        return [3 /*break*/, 7];
                    _b = 0, offers_1 = offers;
                    _c.label = 3;
                case 3:
                    if (!(_b < offers_1.length)) return [3 /*break*/, 7];
                    offer = offers_1[_b];
                    peerkid = offer.peerkid, sdp = offer.sdp;
                    connect = module(peerkid);
                    return [4 /*yield*/, connect.setOffer(sdp)];
                case 4:
                    answer = _c.sent();
                    peer.rpc(FindNodeAnswer(answer, peerkid));
                    return [4 /*yield*/, connect.onConnect.asPromise()];
                case 5:
                    _c.sent();
                    ktable.add(connect);
                    listen_1.default(module, connect, ktable);
                    _c.label = 6;
                case 6:
                    _b++;
                    return [3 /*break*/, 3];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, ktable.getPeer(searchkid)];
            }
        });
    });
}
exports.default = findNode;
//# sourceMappingURL=index.js.map