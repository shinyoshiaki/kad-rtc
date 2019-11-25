"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
function findValue(key, di, opt) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { kTable, rpcManager, signaling } = di;
        let { timeout } = di.opt;
        if (opt && opt.preferTimeout)
            timeout = opt.preferTimeout;
        let result;
        const job = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const findValueResultResult = yield Promise.all(kTable.allPeers.map((proxy) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const except = kTable.findNode(key).map(({ kid }) => kid);
                const res = yield rpcManager
                    .getWait(proxy, FindValue(key, except))(timeout)
                    .catch(() => { });
                if (res) {
                    const { item, offers } = res.value;
                    if (item && !result) {
                        result = { item, peer: proxy };
                        return { offers: [], proxy };
                    }
                    else if (offers) {
                        if (offers.length > 0) {
                            return { offers, proxy };
                        }
                    }
                }
                else {
                    console.log("timeout", proxy.type, timeout);
                }
                return { offers: [], proxy };
            })));
            if (result)
                return;
            const findValueAnswer = (offer, proxy) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { peerKid, sdp } = offer;
                const { peer, candidate } = signaling.create(peerKid);
                const _createAnswer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const answer = yield peer.setOffer(sdp);
                    rpcManager.run(proxy, FindValueAnswer(answer, peerKid));
                    const err = yield peer.onConnect.asPromise(timeout).catch(() => {
                        return "err";
                    });
                    if (err) {
                        signaling.delete(peerKid);
                    }
                    else {
                        listeners_1.listeners(peer, di);
                    }
                });
                if (peer) {
                    yield _createAnswer(peer);
                }
                else if (candidate) {
                    const { peer, event } = candidate;
                    // node.ts側でタイミング悪くPeerを作ってしまった場合の処理
                    // (並行テスト時にしか起きないと思う)
                    if (peer.SdpType === "offer") {
                        yield _createAnswer(peer);
                    }
                    else {
                        yield event.asPromise(timeout).catch(() => { });
                    }
                }
                // 相手側のlistenが完了するまで待つ
                // TODO : ちゃんと実装する
                yield new Promise(r => setTimeout(r, 100));
            });
            yield Promise.all(findValueResultResult
                .map(v => v.offers.map(offer => findValueAnswer(offer, v.proxy)))
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
const FindValue = (key, except) => ({
    type: "FindValue",
    key,
    except
});
const FindValueAnswer = (sdp, peerKid) => ({
    type: "FindValueAnswer",
    sdp,
    peerKid
});
//# sourceMappingURL=index.js.map