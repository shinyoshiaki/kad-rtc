"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class PeerClass {
    constructor(kid) {
        this.kid = kid;
    }
}
class PeerMock {
    constructor(kid) {
        this.kid = kid;
        this.type = "mock";
        this.onData = new rx_mini_1.default();
        this.SdpType = undefined;
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = new rx_mini_1.default();
        this.onConnect = new rx_mini_1.default();
        this.rpc = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield new Promise(r => setTimeout(r));
            this.targetContext.onData.execute(data);
        });
        this.parseRPC = (data) => undefined;
        this.eventRpc = (type, id) => {
            const observer = new rx_mini_1.default();
            const { unSubscribe } = this.onData.subscribe(data => {
                if (data.type === type && data.id === id) {
                    observer.execute(data);
                    unSubscribe();
                }
            });
            return observer;
        };
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.SdpType = "offer";
            return this;
        });
        this.setOffer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.SdpType = "answer";
            this.targetContext = sdp;
            return this;
        });
        this.setAnswer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { onConnect } = sdp;
            this.targetContext = sdp;
            yield new Promise(r => setTimeout(r, 0));
            onConnect.execute(null);
            this.onConnect.execute(null);
            return undefined;
        });
        this.disconnect = () => {
            const { onDisconnect, onData } = this.targetContext;
            onDisconnect.execute(null);
            this.onDisconnect.execute(null);
            onData.allUnsubscribe();
            this.onData.allUnsubscribe();
        };
        this.onData.subscribe(data => {
            try {
                if (data.type) {
                    this.onRpc.execute(data);
                }
            }
            catch (error) { }
        });
    }
}
exports.PeerMock = PeerMock;
//# sourceMappingURL=base.js.map