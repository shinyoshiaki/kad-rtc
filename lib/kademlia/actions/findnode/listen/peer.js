"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../../listeners");
class FindNodePeer {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.candidates = {};
        this.findNodeProxyOpen = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, signaling } = this.di;
            const { finderkid, id } = data;
            const { peer } = signaling.create(finderkid);
            if (peer) {
                this.candidates[finderkid] = peer;
                const offer = yield peer.createOffer();
                this.listen.rpc(Object.assign(Object.assign({}, FindNodePeerOffer(kTable.kid, JSON.stringify(offer))), { id }));
            }
            else {
                this.listen.rpc(Object.assign(Object.assign({}, FindNodePeerOffer(kTable.kid)), { id }));
            }
        });
        this.findNodeProxyAnswer = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            .asObservable("FindNodeProxyOpen", listen)
            .subscribe(this.findNodeProxyOpen);
        rpcManager
            .asObservable("FindNodeProxyAnswer", listen)
            .subscribe(this.findNodeProxyAnswer);
    }
}
exports.default = FindNodePeer;
const FindNodePeerOffer = (peerkid, sdp) => ({
    rpc: "FindNodePeerOffer",
    sdp,
    peerkid
});
//# sourceMappingURL=peer.js.map