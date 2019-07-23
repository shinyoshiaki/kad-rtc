"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const webrtc4me_1 = tslib_1.__importDefault(require("webrtc4me"));
const msgpack_1 = require("@msgpack/msgpack");
const const_1 = require("../../const");
const wrtc = require("wrtc");
exports.PeerModule = (kid) => new PeerWebRTC(kid);
class PeerWebRTC {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.peer = new webrtc4me_1.default({ disable_stun: true, wrtc });
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = new rx_mini_1.default();
        this.onConnect = new rx_mini_1.default();
        this.parseRPC = (data) => {
            const buffer = Buffer.from(data);
            try {
                const data = msgpack_1.decode(buffer);
                if (data.rpc) {
                    return data;
                }
            }
            catch (error) {
                console.error(error, buffer);
            }
            return undefined;
        };
        this.rpc = (send) => {
            const packet = msgpack_1.encode(send);
            this.peer.send(packet);
        };
        this.eventRpc = (rpc, id) => {
            const observer = new rx_mini_1.default();
            const onData = this.peer.onData.subscribe(msg => {
                const { data } = msg;
                if (typeof data !== "string") {
                    const obj = this.parseRPC(data);
                    if (obj && obj.rpc === rpc) {
                        if (obj.id === id) {
                            observer.execute(data);
                            onData.unSubscribe();
                        }
                    }
                }
            });
            return observer;
        };
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.peer.makeOffer();
            const offer = yield this.peer.onSignal.asPromise();
            yield new Promise(r => setTimeout(r, 0));
            return offer;
        });
        this.setOffer = (offer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.peer.setSdp(offer);
            const answer = yield this.peer.onSignal.asPromise();
            yield new Promise(r => setTimeout(r, 0));
            return answer;
        });
        this.setAnswer = (answer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.peer.setSdp(answer);
            const err = yield this.peer.onConnect
                .asPromise(const_1.timeout)
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
        const onData = this.peer.onData.subscribe(msg => {
            try {
                const { label, data } = msg;
                if (label == "datachannel" && typeof data !== "string") {
                    const obj = this.parseRPC(data);
                    if (obj)
                        this.onRpc.execute(obj);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
        this.onDisconnect.once(onData.unSubscribe);
    }
}
exports.default = PeerWebRTC;
//# sourceMappingURL=webrtc.js.map