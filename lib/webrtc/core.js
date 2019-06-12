"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wrtc_1 = require("wrtc");
const rx_mini_1 = require("rx.mini");
const services_1 = tslib_1.__importDefault(require("./services"));
class WebRTC {
    constructor(opt = {}) {
        this.opt = opt;
        this.pack = rx_mini_1.Pack();
        this.event = this.pack.event;
        this.onSignal = this.event();
        this.onConnect = this.event();
        this.onDisconnect = this.event();
        this.onData = this.event();
        this.onAddTrack = this.event();
        this.isConnected = false;
        this.isDisconnected = false;
        this.isOffer = false;
        this.services = services_1.default();
        this.negotiating = false;
        const { nodeId, stream, track } = opt;
        const { arrayBufferService } = this.services;
        this.dataChannels = {};
        this.nodeId = nodeId || "peer";
        this.rtc = this.prepareNewConnection();
        if (stream) {
            stream.getTracks().forEach(track => this.rtc.addTrack(track, stream));
        }
        else if (track) {
            this.rtc.addTrack(track);
        }
        arrayBufferService.listen(this);
    }
    prepareNewConnection() {
        const { disable_stun, trickle } = this.opt;
        const peer = disable_stun
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
        peer.ontrack = evt => {
            const stream = evt.streams[0];
            this.onAddTrack.execute(stream);
            this.remoteStream = stream;
        };
        peer.oniceconnectionstatechange = () => {
            switch (peer.iceConnectionState) {
                case "failed":
                    break;
                case "disconnected":
                    if (this.rtc)
                        try {
                            this.timeoutPing = setTimeout(() => {
                                this.hangUp();
                            }, 2000);
                            this.send("ping", "live");
                        }
                        catch (error) {
                            console.warn("disconnected", { error });
                        }
                    break;
                case "connected":
                    if (this.timeoutPing)
                        clearTimeout(this.timeoutPing);
                    break;
                case "closed":
                    break;
                case "completed":
                    break;
            }
        };
        peer.onicecandidate = evt => {
            if (!this.isConnected) {
                if (evt.candidate) {
                    if (trickle) {
                        this.onSignal.execute({ type: "candidate", ice: evt.candidate });
                    }
                }
                else {
                    if (!trickle && peer.localDescription) {
                        this.onSignal.execute(peer.localDescription);
                    }
                }
            }
        };
        peer.ondatachannel = evt => {
            const dataChannel = evt.channel;
            this.dataChannels[dataChannel.label] = dataChannel;
            this.dataChannelEvents(dataChannel);
        };
        peer.onsignalingstatechange = e => {
            this.negotiating = peer.signalingState != "stable";
        };
        return peer;
    }
    hangUp() {
        this.isDisconnected = true;
        this.isConnected = false;
        this.onDisconnect.execute();
        this.disconnect();
    }
    makeOffer() {
        this.isOffer = true;
        const { trickle } = this.opt;
        this.createDatachannel("datachannel");
        this.rtc.onnegotiationneeded = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.negotiating || this.rtc.signalingState != "stable")
                return;
            this.negotiating = true;
            const sdp = yield this.rtc.createOffer().catch(console.warn);
            if (!sdp)
                return;
            const result = yield this.rtc.setLocalDescription(sdp).catch(() => "err");
            if (result)
                return;
            const local = this.rtc.localDescription;
            if (trickle && local) {
                this.onSignal.execute(local);
            }
            this.negotiationSetting();
        });
    }
    negotiationSetting() {
        this.rtc.onnegotiationneeded = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            if (this.negotiating || this.rtc.signalingState != "stable")
                return;
            this.negotiating = true;
            const offer = yield this.rtc.createOffer({}).catch(console.warn);
            if (!offer)
                return;
            const err = yield this.rtc.setLocalDescription(offer).catch(() => "err");
            if (err)
                return;
            const local = this.rtc.localDescription;
            if (local)
                this.send(JSON.stringify(local), "update");
            this.negotiating = false;
        });
    }
    setAnswer(sdp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.rtc
                .setRemoteDescription(new wrtc_1.RTCSessionDescription(sdp))
                .catch(console.warn);
        });
    }
    makeAnswer(offer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { trickle } = this.opt;
            const err = yield this.rtc
                .setRemoteDescription(new wrtc_1.RTCSessionDescription(offer))
                .catch(() => "err");
            if (err)
                return;
            const answer = yield this.rtc.createAnswer().catch(console.warn);
            if (!answer)
                return;
            yield this.rtc.setLocalDescription(answer).catch(console.warn);
            const local = this.rtc.localDescription;
            if (!local)
                return;
            if (this.isConnected)
                this.send(JSON.stringify(local), "update");
            else if (trickle)
                this.onSignal.execute(local);
            this.negotiationSetting();
        });
    }
    setSdp(sdp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (sdp.type) {
                case "offer":
                    this.makeAnswer(sdp);
                    break;
                case "answer":
                    this.setAnswer(sdp);
                    break;
                case "candidate":
                    yield this.rtc
                        .addIceCandidate(new wrtc_1.RTCIceCandidate(sdp.ice))
                        .catch(console.warn);
                    break;
            }
        });
    }
    createDatachannel(label) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!Object.keys(this.dataChannels).includes(label)) {
                try {
                    const dc = this.rtc.createDataChannel(label);
                    this.dataChannels[label] = dc;
                    yield this.dataChannelEvents(dc);
                }
                catch (dce) {
                    console.error(dce);
                }
            }
        });
    }
    dataChannelEvents(channel) {
        return new Promise(resolve => {
            channel.onopen = () => {
                if (!this.isConnected) {
                    this.isConnected = true;
                    this.onConnect.execute();
                }
                resolve();
            };
            channel.onmessage = (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!event)
                    return;
                try {
                    if (channel.label === "update") {
                        const sdp = JSON.parse(event.data);
                        this.setSdp(sdp);
                    }
                    else if (channel.label === "live") {
                        if (event.data === "ping")
                            this.send("pong", "live");
                        else if (this.timeoutPing)
                            clearTimeout(this.timeoutPing);
                    }
                    else {
                        this.onData.execute({
                            label: channel.label,
                            data: event.data,
                            nodeId: this.nodeId
                        });
                    }
                }
                catch (error) {
                    console.warn(error);
                }
            });
            channel.onerror = err => console.warn(err);
            channel.onclose = () => { };
        });
    }
    send(data, label = "datachannel") {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { arrayBufferService } = this.services;
            if (!Object.keys(this.dataChannels).includes(label)) {
                yield this.createDatachannel(label);
            }
            const sendData = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (typeof data === "string") {
                    this.dataChannels[label].send(data);
                }
                else {
                    if (data.byteLength > 16000) {
                        yield this.createDatachannel(arrayBufferService.label);
                        arrayBufferService.send(data, label, this.dataChannels[arrayBufferService.label]);
                    }
                    else {
                        this.dataChannels[label].send(data);
                    }
                }
            });
            try {
                sendData();
            }
            catch (error) {
                console.warn("retry", error);
                yield new Promise(r => r);
                try {
                    sendData();
                }
                catch (error) {
                    console.error("send fail", error);
                }
            }
        });
    }
    addTrack(track, stream) {
        this.rtc.addTrack(track, stream);
    }
    disconnect() {
        const { rtc, dataChannels } = this;
        if (!rtc)
            return;
        for (let key in dataChannels) {
            const channel = dataChannels[key];
            channel.onmessage = null;
            channel.onopen = null;
            channel.onclose = null;
            channel.onerror = null;
            channel.close();
        }
        this.dataChannels = null;
        rtc.oniceconnectionstatechange = null;
        rtc.onicegatheringstatechange = null;
        rtc.onsignalingstatechange = null;
        rtc.onicecandidate = null;
        rtc.ontrack = null;
        rtc.ondatachannel = null;
        rtc.close();
        this.rtc = null;
        this.pack.finishAll();
    }
}
exports.default = WebRTC;
//# sourceMappingURL=core.js.map