"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const FindValue = (key, except) => {
    return { rpc: "FindValue", key, except };
};
const FindValueAnswer = (sdp, peerkid) => {
    return { rpc: "FindValueAnswer", sdp, peerkid };
};
function findValue(key, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable } = di;
        const { peerCreate } = di.modules;
        let result;
        const findValueAnswer = (offer, peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const connect = peerCreate(peerkid);
            const answer = yield connect.setOffer(sdp);
            peer.rpc(FindValueAnswer(answer, peerkid));
            const res = yield connect.onConnect.asPromise(3333).catch(console.error);
            if (res) {
                kTable.add(connect);
                listeners_1.listeners(connect, di);
            }
        });
        const findValueResult = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            peer.rpc(FindValue(key, except));
            const res = yield peer
                .eventRpc("FindValueResult")
                .asPromise(3333)
                .catch(console.error);
            if (res) {
                const { value, offers } = res.data;
                if (value) {
                    result = value;
                }
                else if (offers) {
                    if (offers.length > 0) {
                        return { offers, peer };
                    }
                }
            }
            return { offers: [], peer };
        });
        const job = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const findValueResultResult = yield Promise.all(kTable.allPeers.map(peer => findValueResult(peer)));
            yield Promise.all(findValueResultResult
                .map(item => item.offers.map(offer => findValueAnswer(offer, item.peer)))
                .flatMap(v => v));
        });
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield job();
            if (result)
                break;
        }
        return result;
    });
}
exports.default = findValue;
//# sourceMappingURL=index.js.map