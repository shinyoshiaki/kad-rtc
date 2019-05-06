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
        for (let peer of kTable.allPeers) {
            const except = kTable.allPeers.map(item => item.kid);
            peer.rpc(FindNode(searchkid, except));
            const res = yield peer
                .eventRpc("FindNodeProxyOffer")
                .asPromise(3333)
                .catch(console.warn);
            if (!res) {
                continue;
            }
            const { peers } = res;
            if (peers.length === 0) {
                continue;
            }
            for (let offer of peers) {
                const { peerkid, sdp } = offer;
                const connect = peerCreate(peerkid);
                const answer = yield connect.setOffer(sdp);
                peer.rpc(FindNodeAnswer(answer, peerkid));
                yield connect.onConnect.asPromise(3333).catch(console.error);
                kTable.add(connect);
                listeners_1.listeners(connect, di);
            }
        }
        return kTable.getPeer(searchkid);
    });
}
exports.default = findNode;
//# sourceMappingURL=index.js.map