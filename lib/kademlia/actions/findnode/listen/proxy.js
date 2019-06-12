"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const const_1 = require("../../../const");
const FindNodeProxyOffer = (peers) => {
    return { rpc: "FindNodeProxyOffer", peers };
};
const FindNodeProxyOpen = (finderkid) => {
    return { rpc: "FindNodeProxyOpen", finderkid };
};
const FindNodeProxyAnswer = (sdp, finderkid) => {
    return { rpc: "FindNodeProxyAnswer", sdp, finderkid };
};
class FindNodeProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        const onRpc = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindNode":
                    this.findnode(data);
                    break;
                case "FindNodeAnswer":
                    this.findnodeanswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => onRpc.unSubscribe());
    }
    findnode(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable, rpcManager } = this.di;
            const { searchkid, except, id } = data;
            const peers = kTable.findNode(searchkid);
            const offers = [];
            const findNodePeerOffer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                    const wait = rpcManager.getWait(peer, FindNodeProxyOpen(this.listen.kid));
                    const res = yield wait(const_1.timeout).catch(() => { });
                    if (res) {
                        const { peerkid, sdp } = res;
                        if (sdp)
                            offers.push({ peerkid, sdp });
                    }
                }
            });
            yield Promise.all(peers.map(peer => findNodePeerOffer(peer)));
            this.listen.rpc(Object.assign({}, FindNodeProxyOffer(offers), { id }));
        });
    }
    findnodeanswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kTable } = this.di;
            const { sdp, peerkid, id } = data;
            const peer = kTable.getPeer(peerkid);
            if (!peer)
                return;
            peer.rpc(Object.assign({}, FindNodeProxyAnswer(sdp, this.listen.kid), { id }));
        });
    }
}
exports.default = FindNodeProxy;
//# sourceMappingURL=proxy.js.map