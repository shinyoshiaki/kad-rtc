"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const const_1 = require("../../const");
function findNode(searchkid, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, signaling } = di;
        if (kTable.getPeer(searchkid))
            return kTable.getPeer(searchkid);
        const findNodeProxyOfferResult = yield Promise.all(kTable.findNode(searchkid).map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            const wait = rpcManager.getWait(peer, FindNode(searchkid, except));
            const res = yield wait(const_1.timeout).catch(() => { });
            if (res) {
                const { peers } = res;
                if (peers.length > 0)
                    return { peers, peer };
            }
            return { peers: [], peer };
        })));
        const findNodeAnswer = (proxy, offer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const { peer, candidate } = signaling.create(peerkid);
            if (peer) {
                const answer = yield peer.setOffer(JSON.parse(sdp));
                rpcManager
                    .asObservable("FindNodeProxyAnswerError", proxy)
                    .once(() => {
                    peer.onConnect.error("FindNodeProxyAnswerError");
                });
                rpcManager.run(proxy, FindNodeAnswer(JSON.stringify(answer), peerkid));
                const err = yield peer.onConnect.asPromise(const_1.timeout).catch(() => "err");
                if (err) {
                    signaling.delete(peerkid);
                }
                else {
                    listeners_1.listeners(peer, di);
                }
            }
            else if (candidate) {
                const peer = yield candidate.asPromise(const_1.timeout).catch(() => { });
                if (peer)
                    listeners_1.listeners(peer, di);
            }
        });
        yield Promise.all(findNodeProxyOfferResult
            .map(item => item.peers.map(offer => findNodeAnswer(item.peer, offer)))
            .flatMap(v => v));
        return kTable.getPeer(searchkid);
    });
}
exports.default = findNode;
const FindNode = (searchkid, except) => ({
    type: "FindNode",
    searchkid,
    except
});
const FindNodeAnswer = (sdp, peerkid) => ({
    type: "FindNodeAnswer",
    sdp,
    peerkid
});
//# sourceMappingURL=index.js.map