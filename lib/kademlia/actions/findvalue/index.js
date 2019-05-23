"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const const_1 = require("../../const");
const FindValue = (key, except) => {
    return { rpc: "FindValue", key, except };
};
const FindValueAnswer = (sdp, peerkid) => {
    return { rpc: "FindValueAnswer", sdp, peerkid };
};
function findValue(key, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, signaling } = di;
        let result;
        const findValueResult = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            const wait = rpcManager.getWait(peer, FindValue(key, except));
            const res = yield wait(const_1.timeout).catch(() => { });
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
        const findValueAnswer = (offer, proxy) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const { peer, candidate } = signaling.create(peerkid);
            if (peer) {
                const answer = yield peer.setOffer(sdp);
                rpcManager.run(proxy, FindValueAnswer(answer, peerkid));
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