"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const FindNode = (searchkid, except) => {
    return { rpc: "FindNode", searchkid, except };
};
const FindNodeAnswer = (sdp, peerkid) => {
    return { rpc: "FindNodeAnswer", sdp, peerkid };
};
function findNode(searchkid, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable } = di;
        const { peerCreate } = di.modules;
        if (kTable.getPeer(searchkid))
            return kTable.getPeer(searchkid);
        const findNodeProxyOffer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            peer.rpc(FindNode(searchkid, except));
            const res = yield peer
                .eventRpc("FindNodeProxyOffer")
                .asPromise(3333)
                .catch(console.warn);
            if (res) {
                const { peers } = res;
                if (peers.length > 0) {
                    return { peers, peer };
                }
            }
            return { peers: [], peer };
        });
        const findNodeAnswer = (peer, offer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const connect = peerCreate(peerkid);
            const answer = yield connect.setOffer(sdp);
            peer.rpc(FindNodeAnswer(answer, peerkid));
            const res = yield connect.onConnect.asPromise(3333).catch(console.error);
            if (res) {
                kTable.add(connect);
                listeners_1.listeners(connect, di);
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