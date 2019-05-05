"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const wrtc_1 = require("wrtc");
const event_1 = tslib_1.__importDefault(require("./utill/event"));
class WebRTC {
    constructor(opt = {}) {
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
        const { nodeId, stream, track } = opt;
        this.dataChannels = {};
        this.nodeId = nodeId || "peer";
        this.rtc = this.prepareNewConnection();
        if (stream) {
            stream.getTracks().forEach(track => this.rtc.addTrack(track, stream));
        }
        else if (track) {
            this.rtc.addTrack(track);
        }
    }
    prepareNewConnection() {
        const { disable_stun, trickle } = this.opt;
        let peer = {};
        try {
            peer = disable_stun
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
        }
        catch (error) {
            console.error(error);
        }
        peer.ontrack = evt => {
            const stream = evt.streams[0];
            this.onAddTrack.excute(stream);
            this.remoteStream = stream;
        };
        peer.oniceconnectionstatechange = () => {
            switch (peer.iceConnectionState) {
                case "failed":
                    break;
                case "disconnected":
                    try {
                        this.timeoutPing = setTimeout(() => {
                            this.hangUp();
                        }, 2000);
                        this.send("ping", "live");
                    }
                    catch (error) {
                        console.error({ error });
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
                        this.onSignal.excute({ type: "candidate", ice: evt.candidate });
                    }
                }
                else {
                    if (!trickle && peer.localDescription) {
                        this.onSignal.excute(peer.localDescription);
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
        this.onDisconnect.excute();
    }
    makeOffer() {
        this.isOffer = true;
        const { trickle } = this.opt;
        this.createDatachannel("datachannel");
        this.rtc.onnegotiationneeded = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.negotiating || this.rtc.signalingState != "stable")
                return;
            this.negotiating = true;
            const sdp = yield this.rtc.createOffer().catch(console.error);
            if (!sdp)
                return;
            const result = yield this.rtc
                .setLocalDescription(sdp)
                .catch(err => JSON.stringify(err) + "err");
            if (typeof result === "string") {
                return;
            }
            const local = this.rtc.localDescription;
            if (trickle && local) {
                this.onSignal.excute(local);
            }
            this.negotiation();
        });
    }
    negotiation() {
        this.rtc.onnegotiationneeded = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            try {
                if (this.negotiating || this.rtc.signalingState != "stable")
                    return;
                this.negotiating = true;
                const options = {};
                const sessionDescription = yield this.rtc.createOffer(options).catch();
                yield this.rtc.setLocalDescription(sessionDescription).catch();
                const local = this.rtc.localDescription;
                if (local) {
                    this.send(JSON.stringify(local), "update");
                }
            }
            finally {
                this.negotiating = false;
            }
        });
    }
    setAnswer(sdp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.isOffer) {
                yield this.rtc
                    .setRemoteDescription(new wrtc_1.RTCSessionDescription(sdp))
                    .catch(console.error);
            }
        });
    }
    makeAnswer(offer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { trickle } = this.opt;
            yield this.rtc
                .setRemoteDescription(new wrtc_1.RTCSessionDescription(offer))
                .catch(console.error);
            const answer = yield this.rtc.createAnswer().catch(console.error);
            if (!answer) {
                console.error("no answer");
                return;
            }
            yield this.rtc.setLocalDescription(answer).catch(console.error);
            const local = this.rtc.localDescription;
            if (this.isConnected) {
                this.send(JSON.stringify(local), "update");
            }
            else if (trickle && local) {
                this.onSignal.excute(local);
            }
            this.negotiation();
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
                        .catch(console.error);
                    break;
            }
        });
    }
    createDatachannel(label) {
        if (!Object.keys(this.dataChannels).includes(label)) {
            try {
                const dc = this.rtc.createDataChannel(label);
                this.dataChannelEvents(dc);
                this.dataChannels[label] = dc;
            }
            catch (dce) { }
        }
    }
    dataChannelEvents(channel) {
        channel.onopen = () => {
            if (!this.isConnected) {
                this.isConnected = true;
                this.onConnect.excute();
            }
        };
        try {
            channel.onmessage = (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!event)
                    return;
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
                    this.onData.excute({
                        label: channel.label,
                        data: event.data,
                        nodeId: this.nodeId
                    });
                }
            });
        }
        catch (error) {
            console.error(error);
        }
        channel.onerror = err => console.error(err);
        channel.onclose = () => console.error("close", this.nodeId);
    }
    send(data, label) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            label = label || "datachannel";
            if (!Object.keys(this.dataChannels).includes(label)) {
                this.createDatachannel(label);
            }
            try {
                yield new Promise(r => setTimeout(r, 0));
                this.dataChannels[label].send(data);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    addTrack(track, stream) {
        this.rtc.addTrack(track, stream);
    }
    disconnect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { rtc, dataChannels } = this;
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
            yield new Promise(r => setTimeout(r, 1000 * 30));
        });
    }
}
exports.default = WebRTC;
//# sourceMappingURL=core.js.map