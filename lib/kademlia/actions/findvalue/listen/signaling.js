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
            const { kTable, signaling } = this.di;
            const { finderKid, id } = data;
            const { peer } = signaling.create(finderKid);
            if (peer) {
                this.candidates[finderKid] = peer;
                const offer = yield peer.createOffer();
                this.listen.rpc(Object.assign(Object.assign({}, FindValuePeerOffer(kTable.kid, offer)), { id }));
            }
            else {
                this.listen.rpc(Object.assign(Object.assign({}, FindValuePeerOffer(kTable.kid)), { id }));
            }
        });
        this.findValueProxyAnswer = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { finderKid, sdp } = data;
            const peer = this.candidates[finderKid];
            if (!peer)
                return;
            const err = yield peer.setAnswer(sdp);
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
const FindValuePeerOffer = (peerKid, sdp) => ({
    type: "FindValuePeerOffer",
    sdp,
    peerKid
});
//# sourceMappingURL=signaling.js.map