"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var wrtc_1 = require("wrtc");
var event_1 = tslib_1.__importDefault(require("./utill/event"));
var WebRTC = /** @class */ (function () {
    function WebRTC(opt) {
        var _this = this;
        if (opt === void 0) { opt = {}; }
        this.opt = opt;
        this.onSignal = new event_1.default();
        this.onConnect = new event_1.default();
        this.onDisconnect = new event_1.default();
        this.onData = new event_1.default();
        this.onAddTrack = new event_1.default();
        this.isConnected = false;
        this.isDisconnected = false;
        this.isOffer = false;
        this.negotiating = false;
        var nodeId = opt.nodeId, stream = opt.stream, track = opt.track;
        this.dataChannels = {};
        this.nodeId = nodeId || "peer";
        this.rtc = this.prepareNewConnection();
        if (stream) {
            stream.getTracks().forEach(function (track) { return _this.rtc.addTrack(track, stream); });
        }
        else if (track) {
            this.rtc.addTrack(track);
        }
    }
    WebRTC.prototype.prepareNewConnection = function () {
        var _this = this;
        var _a = this.opt, disable_stun = _a.disable_stun, trickle = _a.trickle;
        var peer = disable_stun
            ? new wrtc_1.RTCPeerConnection({
                iceServers: []
            })
            : new wrtc_1.RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.l.google.com:19302"
                    }
                ]
            });
        peer.ontrack = function (evt) {
            var stream = evt.streams[0];
            _this.onAddTrack.excute(stream);
            _this.remoteStream = stream;
        };
        peer.oniceconnectionstatechange = function () {
            switch (peer.iceConnectionState) {
                case "failed":
                    break;
                case "disconnected":
                    try {
                        _this.timeoutPing = setTimeout(function () {
                            _this.hangUp();
                        }, 2000);
                        _this.send("ping", "live");
                    }
                    catch (error) {
                        console.warn({ error: error });
                    }
                    break;
                case "connected":
                    if (_this.timeoutPing)
                        clearTimeout(_this.timeoutPing);
                    break;
                case "closed":
                    break;
                case "completed":
                    break;
            }
        };
        peer.onicecandidate = function (evt) {
            if (!_this.isConnected) {
                if (evt.candidate) {
                    if (trickle) {
                        _this.onSignal.excute({ type: "candidate", ice: evt.candidate });
                    }
                }
                else {
                    if (!trickle && peer.localDescription) {
                        _this.onSignal.excute(peer.localDescription);
                    }
                }
            }
        };
        peer.ondatachannel = function (evt) {
            var dataChannel = evt.channel;
            _this.dataChannels[dataChannel.label] = dataChannel;
            _this.dataChannelEvents(dataChannel);
        };
        peer.onsignalingstatechange = function (e) {
            _this.negotiating = peer.signalingState != "stable";
        };
        return peer;
    };
    WebRTC.prototype.hangUp = function () {
        this.isDisconnected = true;
        this.isConnected = false;
        this.onDisconnect.excute();
    };
    WebRTC.prototype.makeOffer = function () {
        var _this = this;
        this.isOffer = true;
        var trickle = this.opt.trickle;
        this.createDatachannel("datachannel");
        this.rtc.onnegotiationneeded = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var sdp, result, local;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.negotiating || this.rtc.signalingState != "stable")
                            return [2 /*return*/];
                        this.negotiating = true;
                        return [4 /*yield*/, this.rtc.createOffer().catch(console.warn)];
                    case 1:
                        sdp = _a.sent();
                        if (!sdp)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.rtc
                                .setLocalDescription(sdp)
                                .catch(function (err) { return JSON.stringify(err) + "err"; })];
                    case 2:
                        result = _a.sent();
                        if (typeof result === "string") {
                            return [2 /*return*/];
                        }
                        local = this.rtc.localDescription;
                        if (trickle && local) {
                            this.onSignal.excute(local);
                        }
                        this.negotiation();
                        return [2 /*return*/];
                }
            });
        }); };
    };
    WebRTC.prototype.negotiation = function () {
        var _this = this;
        this.rtc.onnegotiationneeded = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, sessionDescription, local;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 5]);
                        if (this.negotiating || this.rtc.signalingState != "stable")
                            return [2 /*return*/];
                        this.negotiating = true;
                        options = {};
                        return [4 /*yield*/, this.rtc.createOffer(options).catch()];
                    case 2:
                        sessionDescription = _a.sent();
                        return [4 /*yield*/, this.rtc.setLocalDescription(sessionDescription).catch()];
                    case 3:
                        _a.sent();
                        local = this.rtc.localDescription;
                        if (local) {
                            this.send(JSON.stringify(local), "update");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.negotiating = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
    };
    WebRTC.prototype.setAnswer = function (sdp) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isOffer) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rtc
                                .setRemoteDescription(new wrtc_1.RTCSessionDescription(sdp))
                                .catch(console.warn)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    WebRTC.prototype.makeAnswer = function (offer) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var trickle, answer, local;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trickle = this.opt.trickle;
                        return [4 /*yield*/, this.rtc
                                .setRemoteDescription(new wrtc_1.RTCSessionDescription(offer))
                                .catch(console.warn)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rtc.createAnswer().catch(console.warn)];
                    case 2:
                        answer = _a.sent();
                        if (!answer) {
                            console.warn("no answer");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.rtc.setLocalDescription(answer).catch(console.warn)];
                    case 3:
                        _a.sent();
                        local = this.rtc.localDescription;
                        if (this.isConnected) {
                            this.send(JSON.stringify(local), "update");
                        }
                        else if (trickle && local) {
                            this.onSignal.excute(local);
                        }
                        this.negotiation();
                        return [2 /*return*/];
                }
            });
        });
    };
    WebRTC.prototype.setSdp = function (sdp) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = sdp.type;
                        switch (_a) {
                            case "offer": return [3 /*break*/, 1];
                            case "answer": return [3 /*break*/, 2];
                            case "candidate": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        this.makeAnswer(sdp);
                        return [3 /*break*/, 5];
                    case 2:
                        this.setAnswer(sdp);
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.rtc
                            .addIceCandidate(new wrtc_1.RTCIceCandidate(sdp.ice))
                            .catch(console.warn)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    WebRTC.prototype.createDatachannel = function (label) {
        if (!Object.keys(this.dataChannels).includes(label)) {
            try {
                var dc = this.rtc.createDataChannel(label);
                this.dataChannelEvents(dc);
                this.dataChannels[label] = dc;
            }
            catch (dce) { }
        }
    };
    WebRTC.prototype.dataChannelEvents = function (channel) {
        var _this = this;
        channel.onopen = function () {
            if (!_this.isConnected) {
                _this.isConnected = true;
                _this.onConnect.excute();
            }
        };
        try {
            channel.onmessage = function (event) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var sdp;
                return tslib_1.__generator(this, function (_a) {
                    if (!event)
                        return [2 /*return*/];
                    if (channel.label === "update") {
                        sdp = JSON.parse(event.data);
                        this.setSdp(sdp);
                    }
                    else if (channel.label === "live") {
                        if (event.data === "ping")
                            this.send("pong", "live");
                        else if (this.timeoutPing)
                            clearTimeout(this.timeoutPing);
                    }
                    else {
                        this.onData.excute({
                            label: channel.label,
                            data: event.data,
                            nodeId: this.nodeId
                        });
                    }
                    return [2 /*return*/];
                });
            }); };
        }
        catch (error) { }
        channel.onerror = function (err) { };
        channel.onclose = function () { };
    };
    WebRTC.prototype.send = function (data, label) {
        label = label || "datachannel";
        if (!Object.keys(this.dataChannels).includes(label)) {
            this.createDatachannel(label);
        }
        try {
            this.dataChannels[label].send(data);
        }
        catch (error) { }
    };
    WebRTC.prototype.addTrack = function (track, stream) {
        this.rtc.addTrack(track, stream);
    };
    WebRTC.prototype.disconnect = function () {
        this.rtc.close();
    };
    return WebRTC;
}());
exports.default = WebRTC;
//# sourceMappingURL=core.js.map