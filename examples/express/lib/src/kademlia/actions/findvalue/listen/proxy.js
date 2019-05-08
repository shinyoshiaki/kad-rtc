"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const FindValueResult = (data) => {
    return { rpc: "FindValueResult", data };
};
const FindValueProxyOpen = (finderkid) => {
    return { rpc: "FindValueProxyOpen", finderkid };
};
const FindValueProxyAnswer = (sdp, finderkid) => {
    return { rpc: "FindValueProxyAnswer", sdp, finderkid };
};
class FindValueProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        const discon = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindValue":
                    this.findvalue(data);
                    break;
                case "FindValueAnswer":
                    this.findValueAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    findvalue(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { key, except } = data;
            const { kTable } = this.di;
            const { kvs } = this.di.modules;
            const value = kvs.get(key);
            if (value) {
                this.listen.rpc(FindValueResult({ value }));
            }
            else {
                const peers = kTable.findNode(key);
                const offers = [];
                const findValuePeerOffer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                        peer.rpc(FindValueProxyOpen(this.listen.kid));
                        const res = yield peer
                            .eventRpc("FindValuePeerOffer")
                            .asPromise(3333)
                            .catch(console.error);
                        if (res) {
                            const { peerkid, sdp } = res;
                            offers.push({ peerkid, sdp });
                        }
                    }
                });
                yield Promise.all(peers.map(peer => findValuePeerOffer(peer)));
                this.listen.rpc(FindValueResult({ offers }));
            }
        });
    }
    findValueAnswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sdp, peerkid } = data;
            const { kTable } = this.di;
            const peer = kTable.getPeer(peerkid);
            if (!peer)
                return;
            peer.rpc(FindValueProxyAnswer(sdp, this.listen.kid));
        });
    }
}
exports.default = FindValueProxy;
//# sourceMappingURL=proxy.js.map