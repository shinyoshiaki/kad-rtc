"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_1 = tslib_1.__importDefault(require("../../../utill/event"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.type = "webrtc";
        this.onRpc = new event_1.default();
        this.onDisconnect = new event_1.default();
        this.onConnect = new event_1.default();
        this.onData = new event_1.default();
        this.rpc = (send) => {
            const observer = new event_1.default();
            if (this.send) {
                this.send.excute({ data: send, label: send.rpc });
                this.onData.subscribe(raw => {
                    const data = raw.data;
                    if (raw.label === data.rpc) {
                        observer.excute(data);
                    }
                });
            }
            return observer;
        };
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.onData;
        });
        this.setOffer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.send = sdp;
            return { send: this.onData, connect: this.onConnect };
        });
        this.setAnswer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.send = sdp.send;
            const connect = sdp.connect;
            setTimeout(() => {
                connect.excute();
            }, 0);
            this.onConnect.excute();
            return true;
        });
        this.disconnect = () => { };
        this.onData.subscribe(raw => {
            try {
                const data = raw.data;
                if (data.rpc) {
                    this.onRpc.excute(data);
                }
            }
            catch (error) { }
        });
    }
}
exports.default = Peer;
//# sourceMappingURL=mock.js.map