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
        const { kTable, peerModule } = di;
        let result;
        job: for (let preHash = ""; preHash !== kTable.getHash(key); preHash = kTable.getHash(key)) {
            for (let peer of kTable.allPeers) {
                const except = kTable.allPeers.map(item => item.kid);
                peer.rpc(FindValue(key, except));
                const res = yield peer
                    .eventRpc("FindValueResult")
                    .asPromise();
                const { value, offers } = res.data;
                if (value) {
                    result = value;
                    break job;
                }
                else if (offers) {
                    if (offers.length === 0)
                        continue;
                    for (let offer of offers) {
                        const { peerkid, sdp } = offer;
                        const connect = peerModule(peerkid);
                        const answer = yield connect.setOffer(sdp);
                        peer.rpc(FindValueAnswer(answer, peerkid));
                        yield connect.onConnect.asPromise();
                        kTable.add(connect);
                        listeners_1.listeners(connect, di);
                    }
                }
            }
        }
        return result;
    });
}
exports.default = findValue;
//# sourceMappingURL=index.js.map