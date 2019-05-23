"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
const FindValuePeerOffer = (peerkid, sdp) => {
    return { rpc: "FindValuePeerOffer", sdp, peerkid };
};
class FindValuePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.candidates = {};
        const onRpc = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindValueProxyOpen":
                    this.findValueProxyOpen(data);
                    break;
                case "FindValueProxyAnswer":
                    this.findValueProxyAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => onRpc.unSubscribe());
    }
    findValueProxyOpen(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid } = data;
            const id = data.id;
            const { kTable, signaling } = this.di;
            const { peer } = signaling.create(finderkid);
            if (peer) {
                this.candidates[finderkid] = peer;
                const offer = yield peer.createOffer();
                this.listen.rpc(Object.assign({}, FindValuePeerOffer(kTable.kid, offer), { id }));
            }
            else {
                this.listen.rpc(Object.assign({}, FindValuePeerOffer(kTable.kid), { id }));
            }
        });
    }
    findValueProxyAnswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid, sdp } = data;
            const peer = this.candidates[finderkid];
            if (!peer)
                return;
            yield peer.setAnswer(sdp);
            listeners_1.listeners(peer, this.di);
        });
    }
}
exports.default = FindValuePeer;
//# sourceMappingURL=peer.js.map