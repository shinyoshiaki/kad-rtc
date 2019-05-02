"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
const FindNodePeerOffer = (sdp, peerkid) => {
    return { rpc: "FindNodePeerOffer", sdp, peerkid };
};
class FindNodePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.signaling = {};
        const discon = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindNodeProxyOpen":
                    this.findNodeProxyOpen(data);
                    break;
                case "FindNodeProxyAnswer":
                    this.findNodeProxyAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    findNodeProxyOpen(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid } = data;
            const { kTable } = this.di;
            const { peerCreate } = this.di.modules;
            const peer = peerCreate(finderkid);
            this.signaling[finderkid] = peer;
            const offer = yield peer.createOffer();
            this.listen.rpc(FindNodePeerOffer(offer, kTable.kid));
        });
    }
    findNodeProxyAnswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid, sdp } = data;
            const { kTable } = this.di;
            const peer = this.signaling[finderkid];
            if (!peer)
                return;
            yield peer.setAnswer(sdp);
            kTable.add(peer);
            listeners_1.listeners(peer, this.di);
        });
    }
}
exports.default = FindNodePeer;
//# sourceMappingURL=peer.js.map