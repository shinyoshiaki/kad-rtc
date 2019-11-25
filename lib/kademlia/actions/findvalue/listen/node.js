"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class FindValueProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.timeout = this.di.opt.timeout / 2;
        this.findvalue = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, rpcManager } = this.di;
            const { kvs } = this.di.modules;
            const { key, except, id } = data;
            const item = kvs.get(key);
            if (item) {
                this.listen.rpc(Object.assign(Object.assign({}, FindValueResult({ item })), { id }));
            }
            else {
                const peers = kTable.findNode(key);
                const offers = [];
                yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                        const res = yield rpcManager
                            .getWait(peer, FindValueProxyOpen(this.listen.kid))(this.timeout)
                            .catch(() => { });
                        if (res) {
                            const { peerKid, sdp } = res;
                            if (sdp)
                                offers.push({ peerKid, sdp });
                        }
                        else {
                            console.log("timeout");
                        }
                    }
                })));
                this.listen.rpc(Object.assign(Object.assign({}, FindValueResult({ offers })), { id }));
            }
        });
        this.findValueAnswer = (data) => {
            const { kTable } = this.di;
            const { sdp, peerKid, id } = data;
            const peer = kTable.getPeer(peerKid);
            if (!peer)
                return;
            peer.rpc(Object.assign(Object.assign({}, FindValueProxyAnswer(sdp, this.listen.kid)), { id }));
        };
        const { rpcManager } = di;
        rpcManager
            .asObservable("FindValue", listen)
            .subscribe(this.findvalue);
        rpcManager
            .asObservable("FindValueAnswer", listen)
            .subscribe(this.findValueAnswer);
    }
}
exports.default = FindValueProxy;
const FindValueResult = (value) => ({
    type: "FindValueResult",
    value
});
const FindValueProxyOpen = (finderKid) => ({
    type: "FindValueProxyOpen",
    finderKid
});
const FindValueProxyAnswer = (sdp, finderKid) => ({
    type: "FindValueProxyAnswer",
    sdp,
    finderKid
});
//# sourceMappingURL=node.js.map