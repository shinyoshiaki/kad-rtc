"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const webrtc_1 = tslib_1.__importDefault(require("../../../webrtc"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.peer = new webrtc_1.default({ disable_stun: true });
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = this.peer.onDisconnect;
        this.onConnect = new rx_mini_1.default();
        this.rpc = (send) => {
            this.peer.send(JSON.stringify(send), send.rpc);
        };
        this.eventRpc = (rpc) => {
            const observer = new rx_mini_1.default();
            const once = this.peer.onData.subscribe(raw => {
                if (raw.label === rpc) {
                    const data = JSON.parse(raw.data);
                    observer.excute(data);
                    once.unSubscribe();
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
            this.peer.disconnect();
        };
        this.peer.nodeId = kid;
        this.peer.onConnect.once(() => {
            this.onConnect.excute(true);
        });
        const discon = this.peer.onData.subscribe(raw => {
            try {
                const data = JSON.parse(raw.data);
                if (data.rpc) {
                    this.onRpc.excute(data);
                }
            }
            catch (error) { }
        });
        this.peer.onDisconnect.once(() => {
            discon.unSubscribe();
        });
    }
}
exports.default = Peer;
//# sourceMappingURL=webrtc.js.map