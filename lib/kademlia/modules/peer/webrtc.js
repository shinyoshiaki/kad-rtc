"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webrtc4me_1 = tslib_1.__importDefault(require("webrtc4me"));
const msgpack_1 = require("@msgpack/msgpack");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const wrtc = require("wrtc");
exports.PeerModule = (kid) => new PeerWebRTC(kid);
class PeerWebRTC {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.SdpType = undefined;
        this.peer = new webrtc4me_1.default({ disable_stun: true, wrtc });
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = new rx_mini_1.default();
        this.onConnect = new rx_mini_1.default();
        this.parseRPC = (data) => {
            const buffer = Buffer.from(data);
            try {
                const data = msgpack_1.decode(buffer);
                if (data.type) {
                    if (data.sdp)
                        data.sdp = JSON.parse(data.sdp);
                    return data;
                }
            }
            catch (error) {
                // console.error(error, buffer);
            }
            return undefined;
        };
        this.rpc = (send) => {
            if (send.sdp)
                send.sdp = JSON.stringify(send.sdp);
            const packet = msgpack_1.encode(send);
            this.peer.send(packet);
        };
        this.eventRpc = (type, transactionId) => {
            const observer = new rx_mini_1.default();
            const { unSubscribe } = this.peer.onData.subscribe(({ label, data, dataType }) => {
                if (label == "datachannel" && dataType === "ArrayBuffer") {
                    const obj = this.parseRPC(data);
                    if (obj && obj.type === type) {
                        if (obj.id === transactionId) {
                            observer.execute(msgpack_1.decode(data));
                            unSubscribe();
                        }
                    }
                }
            });
            return observer;
        };
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.SdpType = "offer";
            setTimeout(() => this.peer.makeOffer());
            const offer = yield this.peer.onSignal.asPromise(1000).catch(() => { });
            if (!offer)
                return this.peer.rtc.localDescription;
            return offer;
        });
        this.setOffer = (offer, timeout = 10000) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.SdpType = "answer";
            this.peer.setSdp(offer);
            const answer = yield this.peer.onSignal.asPromise(timeout).catch(() => { });
            if (!answer)
                throw new Error("timeout");
            return answer;
        });
        this.setAnswer = (answer, timeout = 10000) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.peer.setSdp(answer);
            const err = yield this.peer.onConnect
                .asPromise(timeout)
                .catch(e => new Error(e));
            if (err)
                this.onConnect.error(err);
            return err;
        });
        this.disconnect = () => {
            this.peer.hangUp();
        };
        this.peer.nodeId = kid;
        this.peer.onConnect.once(() => this.onConnect.execute(null));
        this.peer.onDisconnect.once(() => this.onDisconnect.execute(null));
        const { unSubscribe } = this.peer.onData.subscribe(({ label, data, dataType }) => {
            try {
                if (label == "datachannel" && dataType === "ArrayBuffer") {
                    const obj = this.parseRPC(data);
                    if (obj)
                        this.onRpc.execute(obj);
                }
            }
            catch (error) {
                // console.error(error);
            }
        });
        this.onDisconnect.once(unSubscribe);
    }
}
exports.default = PeerWebRTC;
//# sourceMappingURL=webrtc.js.map