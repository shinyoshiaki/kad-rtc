"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const const_1 = require("../../../const");
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
        const onRpc = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindValue":
                    this.findvalue(data);
                    break;
                case "FindValueAnswer":
                    this.findValueAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => onRpc.unSubscribe());
    }
    findvalue(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { key, except } = data;
            const id = data.id;
            const { kTable, rpcManager } = this.di;
            const { kvs } = this.di.modules;
            const value = kvs.get(key);
            if (value) {
                this.listen.rpc(Object.assign({}, FindValueResult({ value }), { id }));
            }
            else {
                const peers = kTable.findNode(key);
                const offers = [];
                const findValuePeerOffer = (peer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
                        const wait = rpcManager.getWait(peer, FindValueProxyOpen(this.listen.kid));
                        const res = yield wait(const_1.timeout).catch(() => { });
                        if (res) {
                            const { peerkid, sdp } = res;
                            if (sdp)
                                offers.push({ peerkid, sdp });
                        }
                    }
                });
                yield Promise.all(peers.map(peer => findValuePeerOffer(peer)));
                this.listen.rpc(Object.assign({}, FindValueResult({ offers }), { id }));
            }
        });
    }
    findValueAnswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sdp, peerkid } = data;
            const id = data.id;
            const { kTable } = this.di;
            const peer = kTable.getPeer(peerkid);
            if (!peer)
                return;
            peer.rpc(Object.assign({}, FindValueProxyAnswer(sdp, this.listen.kid), { id }));
        });
    }
}
exports.default = FindValueProxy;
//# sourceMappingURL=proxy.js.map