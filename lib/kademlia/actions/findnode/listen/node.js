"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class FindNodeProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.timeout = this.di.opt.timeout / 2;
        this.findnode = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, rpcManager } = this.di;
            const { searchKid, except, id } = data;
            const offers = [];
            const peers = kTable
                .findNode(searchKid)
                .filter(({ kid }) => kid !== this.listen.kid)
                .filter(({ kid }) => !except.includes(kid));
            yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield rpcManager
                    .getWait(peer, FindNodeProxyOpen(this.listen.kid))(this.timeout)
                    .catch(() => { });
                if (res) {
                    const { peerKid, sdp } = res;
                    if (sdp)
                        offers.push({ peerKid, sdp });
                }
                else {
                    console.log("timeout");
                }
            })));
            this.listen.rpc(Object.assign(Object.assign({}, FindNodeProxyOffer(offers)), { id }));
        });
        this.findNodeAnswer = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable } = this.di;
            const { sdp, peerKid, id } = data;
            const peer = kTable.getPeer(peerKid);
            if (peer) {
                peer.rpc(Object.assign(Object.assign({}, FindNodeProxyAnswer(sdp, this.listen.kid)), { id }));
            }
            else {
                this.listen.rpc(Object.assign(Object.assign({}, FindNodeProxyAnswerError()), { id }));
            }
        });
        const { rpcManager } = di;
        rpcManager
            .asObservable("FindNode", listen)
            .subscribe(this.findnode);
        rpcManager
            .asObservable("FindNodeAnswer", listen)
            .subscribe(this.findNodeAnswer);
    }
}
exports.default = FindNodeProxy;
const FindNodeProxyOffer = (peers) => ({
    type: "FindNodeProxyOffer",
    peers
});
const FindNodeProxyOpen = (finderKid) => ({
    type: "FindNodeProxyOpen",
    finderKid
});
const FindNodeProxyAnswer = (sdp, finderKid) => ({
    type: "FindNodeProxyAnswer",
    sdp,
    finderKid
});
const FindNodeProxyAnswerError = () => ({
    type: "FindNodeProxyAnswerError"
});
//# sourceMappingURL=node.js.map