"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const webrtc_1 = tslib_1.__importDefault(require("../../../webrtc"));
const bson = tslib_1.__importStar(require("bson"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.peer = new webrtc_1.default({ disable_stun: true });
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = this.peer.onDisconnect;
        this.onConnect = new rx_mini_1.default();
        this.parseRPC = (data) => {
            const buffer = Buffer.from(data);
            try {
                const data = bson.deserialize(buffer);
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
            const packet = bson.serialize(send);
            this.peer.send(packet);
        };
        this.eventRpc = (rpc, id) => {
            const observer = new rx_mini_1.default();
            const onData = this.peer.onData.subscribe(raw => {
                const data = this.parseRPC(raw.data);
                if (data && data.rpc === rpc) {
                    if (data.id === id) {
                        observer.execute(data);
                        onData.unSubscribe();
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
            yield this.peer.onConnect.asPromise();
            return true;
        });
        this.disconnect = () => {
            this.peer.hangUp();
        };
        this.peer.nodeId = kid;
        this.peer.onConnect.once(() => {
            this.onConnect.execute(true);
        });
        const onData = this.peer.onData.subscribe(raw => {
            try {
                if (raw.label == "datachannel") {
                    const data = this.parseRPC(raw.data);
                    if (data)
                        this.onRpc.execute(data);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
        this.peer.onDisconnect.once(() => {
            onData.unSubscribe();
        });
    }
}
exports.default = Peer;
//# sourceMappingURL=webrtc.js.map