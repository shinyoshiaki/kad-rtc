"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
class FindValuePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.candidates = {};
        this.findValueProxyOpen = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid, id } = data;
            const { kTable, signaling } = this.di;
            const { peer } = signaling.create(finderkid);
            if (peer) {
                this.candidates[finderkid] = peer;
                const offer = yield peer.createOffer();
                this.listen.rpc(Object.assign({}, FindValuePeerOffer(kTable.kid, JSON.stringify(offer)), { id }));
            }
            else {
                this.listen.rpc(Object.assign({}, FindValuePeerOffer(kTable.kid), { id }));
            }
        });
        this.findValueProxyAnswer = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderkid, sdp } = data;
            const peer = this.candidates[finderkid];
            if (!peer)
                return;
            const err = yield peer.setAnswer(JSON.parse(sdp));
            if (!err)
                listeners_1.listeners(peer, this.di);
        });
        const { rpcManager } = di;
        rpcManager
            .asObservable("FindValueProxyOpen", listen)
            .subscribe(this.findValueProxyOpen);
        rpcManager
            .asObservable("FindValueProxyAnswer", listen)
            .subscribe(this.findValueProxyAnswer);
    }
}
exports.default = FindValuePeer;
const FindValuePeerOffer = (peerkid, sdp) => ({
    rpc: "FindValuePeerOffer",
    sdp,
    peerkid
});
//# sourceMappingURL=peer.js.map