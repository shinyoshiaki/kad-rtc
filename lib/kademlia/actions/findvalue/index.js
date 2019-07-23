"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
const const_1 = require("../../const");
function findValue(key, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, signaling, modules } = di;
        const { kvs } = modules;
        let result;
        const findValueProxy = (proxy) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            const wait = rpcManager.getWait(proxy, FindValue(key, except));
            const res = yield wait(const_1.timeout).catch(console.warn);
            if (res) {
                const { item, offers } = res.data;
                if (item && !result) {
                    result = item;
                    return { offers: [], proxy };
                }
                else if (offers) {
                    if (offers.length > 0) {
                        return { offers, proxy };
                    }
                }
            }
            return { offers: [], proxy };
        });
        const findValueAnswer = (offer, proxy) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerkid, sdp } = offer;
            const { peer, candidate } = signaling.create(peerkid);
            if (peer) {
                const answer = yield peer.setOffer(JSON.parse(sdp));
                rpcManager.run(proxy, FindValueAnswer(JSON.stringify(answer), peerkid));
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
        const job = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const findValueResultResult = yield Promise.all(kTable.allPeers.map(peer => findValueProxy(peer)));
            if (!result) {
                yield Promise.all(findValueResultResult
                    .map(v => v.offers.map(offer => findValueAnswer(offer, v.proxy)))
                    .flatMap(v => v));
            }
        });
        if (kvs.get(key))
            return kvs.get(key);
        for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            yield job();
            if (result)
                break;
        }
        return result;
    });
}
exports.default = findValue;
const FindValue = (key, except) => ({
    rpc: "FindValue",
    key,
    except
});
const FindValueAnswer = (sdp, peerkid) => ({
    rpc: "FindValueAnswer",
    sdp,
    peerkid
});
//# sourceMappingURL=index.js.map