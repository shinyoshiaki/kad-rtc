"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var event_1 = tslib_1.__importDefault(require("../../../utill/event"));
var core_1 = tslib_1.__importDefault(require("../../../webrtc/core"));
exports.PeerModule = function (kid) { return new Peer(kid); };
var Peer = /** @class */ (function () {
    function Peer(kid) {
        var _this = this;
        this.kid = kid;
        this.type = "webrtc";
        this.peer = new core_1.default();
        this.onRpc = new event_1.default();
        this.onDisconnect = this.peer.onDisconnect;
        this.onConnect = this.peer.onConnect;
        this.rpc = function (send) {
            var observer = new event_1.default();
            _this.peer.send(JSON.stringify(send), send.rpc);
            var discon = _this.peer.onData.subscribe(function (raw) {
                var data = JSON.parse(raw.data);
                if (raw.label === data.rpc) {
                    observer.excute(data);
                }
            });
            _this.peer.onDisconnect.once(function () { return discon.unSubscribe(); });
            return observer;
        };
        this.createOffer = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var offer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.peer.makeOffer();
                        return [4 /*yield*/, this.peer.onSignal.asPromise()];
                    case 1:
                        offer = _a.sent();
                        return [2 /*return*/, offer];
                }
            });
        }); };
        this.setOffer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var answer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.peer.setSdp(sdp);
                        return [4 /*yield*/, this.peer.onSignal.asPromise()];
                    case 1:
                        answer = _a.sent();
                        return [2 /*return*/, answer];
                }
            });
        }); };
        this.setAnswer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.peer.setSdp(sdp);
                        return [4 /*yield*/, this.peer.onConnect.asPromise()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        }); };
        this.disconnect = function () {
            _this.peer.disconnect();
        };
        var discon = this.peer.onData.subscribe(function (raw) {
            try {
                var data = JSON.parse(raw.data);
                if (data.rpc) {
                    _this.onRpc.excute(data);
                }
            }
            catch (error) { }
        });
        this.peer.onDisconnect.once(function () { return discon.unSubscribe(); });
    }
    return Peer;
}());
exports.default = Peer;
//# sourceMappingURL=webrtc.js.map