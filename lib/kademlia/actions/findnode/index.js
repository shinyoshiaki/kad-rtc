"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listeners_1 = require("../../listeners");
function findNode(searchKid, di) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connected = [];
        const { kTable, rpcManager, signaling } = di;
        const { timeout } = di.opt;
        if (kTable.getPeer(searchKid))
            return [kTable.getPeer(searchKid)];
        const findNodeProxyOfferResult = yield Promise.all(kTable.findNode(searchKid).map((peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const except = kTable.allPeers.map(item => item.kid);
            const res = yield rpcManager
                .getWait(peer, FindNode(searchKid, except))(timeout)
                .catch(() => { });
            if (res) {
                const { peers } = res;
                if (peers.length > 0)
                    return { peers, peer };
            }
            else {
                console.log("timeout", timeout, peer.type);
            }
            return { peers: [], peer };
        })));
        const _findNodeAnswer = (node, offer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { peerKid, sdp } = offer;
            const { peer, candidate } = signaling.create(peerKid);
            const __createAnswer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const answer = yield peer.setOffer(sdp);
                rpcManager
                    .asObservable("FindNodeProxyAnswerError", node)
                    .once(() => {
                    peer.onConnect.error("FindNodeProxyAnswerError");
                });
                rpcManager.run(node, FindNodeAnswer(answer, peerKid));
                const err = yield peer.onConnect.asPromise(timeout).catch(() => {
                    return "err";
                });
                if (err) {
                    signaling.delete(peerKid);
                }
                else {
                    listeners_1.listeners(peer, di);
                    connected.push(peer);
                }
            });
            if (peer) {
                yield __createAnswer(peer);
            }
            else if (candidate) {
                const { peer, event } = candidate;
                // node.ts側でタイミング悪くPeerを作ってしまった場合の処理
                // (並行テスト時にしか起きないと思う)
                if (peer.SdpType === "offer") {
                    yield __createAnswer(peer);
                }
                else {
                    yield event.asPromise(timeout).catch(() => { });
                }
            }
            // 相手側のlistenが完了するまで待つ
            // TODO : ちゃんと実装する
            yield new Promise(r => setTimeout(r, 100));
        });
        yield Promise.all(findNodeProxyOfferResult
            .map(item => item.peers.map(offer => _findNodeAnswer(item.peer, offer)))
            .flatMap(v => v));
        return connected;
    });
}
exports.default = findNode;
const FindNode = (searchKid, except) => ({
    type: "FindNode",
    searchKid,
    except
});
const FindNodeAnswer = (sdp, peerKid) => ({
    type: "FindNodeAnswer",
    sdp,
    peerKid
});
//# sourceMappingURL=index.js.map