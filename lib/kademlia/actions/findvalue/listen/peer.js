"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
const FindValuePeerOffer = (sdp, peerkid) => {
    return { rpc: "FindValuePeerOffer", sdp, peerkid };
};
class FindValuePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.signaling = {};
        const discon = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindValueProxyOpen":
                    this.findValueProxyOpen(data);
                    break;
                case "FindValueProxyAnswer":
                    this.findValueProxyAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    findValueProxyOpen(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid } = data;
            const { kTable } = this.di;
            const { peerCreate } = this.di.modules;
            const peer = peerCreate(finderkid);
            this.signaling[finderkid] = peer;
            const offer = yield peer.createOffer();
            this.listen.rpc(FindValuePeerOffer(offer, kTable.kid));
        });
    }
    findValueProxyAnswer(data) {
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
exports.default = FindValuePeer;
//# sourceMappingURL=peer.js.map