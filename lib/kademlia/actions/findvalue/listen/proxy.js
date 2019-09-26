"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const const_1 = require("../../../const");
class FindValueProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.findvalue = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, rpcManager } = this.di;
            const { key, except, id } = data;
            const { kvs } = this.di.modules;
            const item = kvs.get(key);
            if (item) {
                this.listen.rpc(Object.assign(Object.assign({}, FindValueResult({ item })), { id }));
            }
            else {
                const peers = kTable.findNode(key);
                const offers = [];
                yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                        const wait = rpcManager.getWait(peer, FindValueProxyOpen(this.listen.kid));
                        const res = yield wait(const_1.timeout).catch(() => { });
                        if (res) {
                            const { peerkid, sdp } = res;
                            if (sdp)
                                offers.push({ peerkid, sdp });
                        }
                    }
                })));
                this.listen.rpc(Object.assign(Object.assign({}, FindValueResult({ offers })), { id }));
            }
        });
        this.findValueAnswer = (data) => {
            const { kTable } = this.di;
            const { sdp, peerkid, id } = data;
            const peer = kTable.getPeer(peerkid);
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
const FindValueResult = (data) => ({
    rpc: "FindValueResult",
    data
});
const FindValueProxyOpen = (finderkid) => ({
    rpc: "FindValueProxyOpen",
    finderkid
});
const FindValueProxyAnswer = (sdp, finderkid) => ({
    rpc: "FindValueProxyAnswer",
    sdp,
    finderkid
});
//# sourceMappingURL=proxy.js.map