"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var event_1 = tslib_1.__importDefault(require("../../../utill/event"));
exports.PeerModule = function (kid) { return new Peer(kid); };
var Peer = /** @class */ (function () {
    function Peer(kid) {
        var _this = this;
        this.kid = kid;
        this.type = "webrtc";
        this.onRpc = new event_1.default();
        this.onDisconnect = new event_1.default();
        this.onConnect = new event_1.default();
        this.onData = new event_1.default();
        this.rpc = function (send) {
            var observer = new event_1.default();
            if (_this.send) {
                _this.send.excute({ data: send, label: send.rpc });
                _this.onData.subscribe(function (raw) {
                    var data = raw.data;
                    if (raw.label === data.rpc) {
                        observer.excute(data);
                    }
                });
            }
            return observer;
        };
        this.createOffer = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.onData];
            });
        }); };
        this.setOffer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.send = sdp;
                return [2 /*return*/, { send: this.onData, connect: this.onConnect }];
            });
        }); };
        this.setAnswer = function (sdp) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var connect;
            return tslib_1.__generator(this, function (_a) {
                this.send = sdp.send;
                connect = sdp.connect;
                setTimeout(function () {
                    connect.excute();
                }, 0);
                this.onConnect.excute();
                return [2 /*return*/, true];
            });
        }); };
        this.disconnect = function () { };
        this.onData.subscribe(function (raw) {
            try {
                var data = raw.data;
                if (data.rpc) {
                    _this.onRpc.excute(data);
                }
            }
            catch (error) { }
        });
    }
    return Peer;
}());
exports.default = Peer;
//# sourceMappingURL=mock.js.map