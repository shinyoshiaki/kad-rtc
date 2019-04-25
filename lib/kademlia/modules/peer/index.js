"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_1 = tslib_1.__importDefault(require("../../../utill/event"));
exports.PeerModule = (kid) => new Peer(kid);
class Peer {
    constructor(kid) {
        this.kid = kid;
        this.onRpc = new event_1.default();
        this.onDisconnect = new event_1.default();
        this.onConnect = new event_1.default();
        this.rpc = (data) => new event_1.default();
        this.createOffer = () => tslib_1.__awaiter(this, void 0, void 0, function* () { });
        this.setOffer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () { });
        this.setAnswer = (sdp) => tslib_1.__awaiter(this, void 0, void 0, function* () { });
        this.disconnect = () => { };
    }
}
exports.default = Peer;
//# sourceMappingURL=index.js.map