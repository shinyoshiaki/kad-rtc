"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const const_1 = require("../../const");
const FindNode = (searchkid, except) => {
    return { rpc: "FindNode", searchkid, except };
};
const FindNodeAnswer = (sdp, peerkid) => {
    return { rpc: "FindNodeAnswer", sdp, peerkid };
};
function findNode(searchkid, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, signaling } = di;
        if (kTable.getPeer(searchkid))
            return kTable.getPeer(searchkid);
        const findNodeProxyOffer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            const wait = rpcManager.getWait(peer, FindNode(searchkid, except));
            const res = yield wait(const_1.timeout).catch(() => { });
            if (res) {
                const { peers } = res;
                if (peers.length > 0) {
                    return { peers, peer };
                }
            }
            return { peers: [], peer };
        });
        const findNodeAnswer = (proxy, offer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const { peer, candidate } = signaling.create(peerkid);
            if (peer) {
                const answer = yield peer.setOffer(sdp);
                rpcManager.run(proxy, FindNodeAnswer(answer, peerkid));
                const res = yield peer.onConnect.asPromise(const_1.timeout).catch(() => {
                    signaling.delete(peerkid);
                });
                if (res) {
                    listeners_1.listeners(peer, di);
                }
            }
            else if (candidate) {
                const peer = yield candidate.asPromise(const_1.timeout).catch(() => { });
                if (peer)
                    listeners_1.listeners(peer, di);
            }
        });
        const findNodeProxyOfferResult = yield Promise.all(kTable.findNode(searchkid).map(peer => findNodeProxyOffer(peer)));
        yield Promise.all(findNodeProxyOfferResult
            .map(item => item.peers.map(offer => findNodeAnswer(item.peer, offer)))
            .flatMap(v => v));
        return kTable.getPeer(searchkid);
    });
}
exports.default = findNode;
//# sourceMappingURL=index.js.map