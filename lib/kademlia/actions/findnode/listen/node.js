"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const const_1 = require("../../../const");
class FindNodeProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        this.findnode = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, rpcManager } = this.di;
            const { searchkid, except, id } = data;
            const offers = [];
            const peers = kTable.findNode(searchkid);
            yield Promise.all(peers.map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                    const wait = rpcManager.getWait(peer, FindNodeProxyOpen(this.listen.kid));
                    const res = yield wait(const_1.timeout).catch(() => { });
                    if (res) {
                        const { peerkid, sdp } = res;
                        if (sdp)
                            offers.push({ peerkid, sdp });
                    }
                }
            })));
            this.listen.rpc(Object.assign(Object.assign({}, FindNodeProxyOffer(offers)), { id }));
        });
        this.findnodeanswer = (data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable } = this.di;
            const { sdp, peerkid, id } = data;
            const peer = kTable.getPeer(peerkid);
            if (peer)
                peer.rpc(Object.assign(Object.assign({}, FindNodeProxyAnswer(sdp, this.listen.kid)), { id }));
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
            .subscribe(this.findnodeanswer);
    }
}
exports.default = FindNodeProxy;
const FindNodeProxyOffer = (peers) => ({
    type: "FindNodeProxyOffer",
    peers
});
const FindNodeProxyOpen = (finderkid) => ({
    type: "FindNodeProxyOpen",
    finderkid
});
const FindNodeProxyAnswer = (sdp, finderkid) => ({
    type: "FindNodeProxyAnswer",
    sdp,
    finderkid
});
const FindNodeProxyAnswerError = () => ({
    type: "FindNodeProxyAnswerError"
});
//# sourceMappingURL=node.js.map