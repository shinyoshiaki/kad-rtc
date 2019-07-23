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
        this.onRpc = new rx_mini_1.default();
        this.onDisconnect = new rx_mini_1.default();
        this.onConnect = new rx_mini_1.default();
        this.rpc = (data) => { };
        this.parseRPC = (data) => undefined;
        this.eventRpc = (rpc, id) => new rx_mini_1.default();
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return null; });
        this.setOffer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () { return null; });
        this.setAnswer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () { return null; });
        this.disconnect = () => { };
    }
}
exports.PeerMock = PeerMock;
//# sourceMappingURL=base.js.map