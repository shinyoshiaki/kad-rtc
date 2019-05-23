"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
const FindNodePeerOffer = (peerkid, sdp) => {
    return { rpc: "FindNodePeerOffer", sdp, peerkid };
};
class FindNodePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.candidates = {};
        const onRpc = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindNodeProxyOpen":
                    this.findNodeProxyOpen(data);
                    break;
                case "FindNodeProxyAnswer":
                    this.findNodeProxyAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => onRpc.unSubscribe());
    }
    findNodeProxyOpen(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid } = data;
            const id = data.id;
            const { kTable, signaling } = this.di;
            const { peer } = signaling.create(finderkid);
            if (peer) {
                this.candidates[finderkid] = peer;
                const offer = yield peer.createOffer();
                this.listen.rpc(Object.assign({}, FindNodePeerOffer(kTable.kid, offer), { id }));
            }
            else {
                this.listen.rpc(Object.assign({}, FindNodePeerOffer(kTable.kid), { id }));
            }
        });
    }
    findNodeProxyAnswer(data) {
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
exports.default = FindNodePeer;
//# sourceMappingURL=peer.js.map