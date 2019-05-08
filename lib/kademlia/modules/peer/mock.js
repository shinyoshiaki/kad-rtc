"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.type = "mock";
        this.onData = new rx_mini_1.default();
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = new rx_mini_1.default();
        this.onConnect = new rx_mini_1.default();
        this.rpc = (send) => {
            setTimeout(() => {
                if (this.send)
                    this.send.excute({ data: send, label: send.rpc });
            }, 0);
        };
        this.eventRpc = (rpc) => {
            const observer = new rx_mini_1.default();
            const once = this.onData.subscribe(raw => {
                if (raw.label === rpc) {
                    const data = raw.data;
                    observer.excute(data);
                    once.unSubscribe();
                }
            });
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
            return new Promise(resolve => {
                this.send = sdp.send;
                const connect = sdp.connect;
                setTimeout(() => {
                    connect.excute();
                    this.onConnect.excute(true);
                    resolve(true);
                }, 0);
            });
        });
        this.disconnect = () => { };
        this.onData.subscribe(raw => {
            const data = raw.data;
            if (data.rpc) {
                this.onRpc.excute(data);
            }
        });
    }
}
exports.default = Peer;
//# sourceMappingURL=mock.js.map