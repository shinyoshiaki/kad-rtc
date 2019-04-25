"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_1 = tslib_1.__importDefault(require("../../../utill/event"));
const core_1 = tslib_1.__importDefault(require("../../../webrtc/core"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.peer = new core_1.default();
        this.onRpc = new event_1.default();
        this.onDisconnect = this.peer.onDisconnect;
        this.onConnect = this.peer.onConnect;
        this.rpc = (send) => {
            const observer = new event_1.default();
            this.peer.send(JSON.stringify(send), send.rpc);
            const discon = this.peer.onData.subscribe(raw => {
                const data = JSON.parse(raw.data);
                if (raw.label === data.rpc) {
                    observer.excute(data);
                }
            });
            this.peer.onDisconnect.once(() => discon.unSubscribe());
            return observer;
        };
        this.createOffer = async () => {
            this.peer.makeOffer();
            const offer = await this.peer.onSignal.asPromise();
            return offer;
        };
        this.setOffer = async (sdp) => {
            this.peer.setSdp(sdp);
            const answer = await this.peer.onSignal.asPromise();
            return answer;
        };
        this.setAnswer = async (sdp) => {
            this.peer.setSdp(sdp);
            await this.peer.onConnect.asPromise();
            return true;
        };
        this.disconnect = () => {
            this.peer.disconnect();
        };
        const discon = this.peer.onData.subscribe(raw => {
            try {
                const data = JSON.parse(raw.data);
                if (data.rpc) {
                    this.onRpc.excute(data);
                }
            }
            catch (error) { }
        });
        this.peer.onDisconnect.once(() => discon.unSubscribe());
    }
}
exports.default = Peer;
//# sourceMappingURL=webrtc.js.map