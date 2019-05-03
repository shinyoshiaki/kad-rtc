"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const FindNodeProxyOffer = (peers) => {
    return { rpc: "FindNodeProxyOffer", peers };
};
const FindNodeProxyOpen = (finderkid) => {
    return { rpc: "FindNodeProxyOpen", finderkid };
};
const FindNodeProxyAnswer = (sdp, finderkid) => {
    return { rpc: "FindNodeProxyAnswer", sdp, finderkid };
};
class FindNodeProxy {
    constructor(listen, di) {
        this.listen = listen;
        this.di = di;
        const discon = listen.onRpc.subscribe((data) => {
            switch (data.rpc) {
                case "FindNode":
                    this.findnode(data);
                    break;
                case "FindNodeAnswer":
                    this.findnodeanswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    findnode(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { searchkid, except } = data;
            const { kTable } = this.di;
            const peers = kTable.findNode(searchkid);
            const offers = [];
            for (let peer of peers) {
                if (peer.kid === this.listen.kid)
                    continue;
                if (except.includes(peer.kid))
                    continue;
                peer.rpc(FindNodeProxyOpen(this.listen.kid));
                const res = yield peer
                    .eventRpc("FindNodePeerOffer")
                    .asPromise(3333)
                    .catch(console.warn);
                if (!res) {
                    continue;
                }
                const { peerkid, sdp } = res;
                offers.push({ peerkid, sdp });
            }
            this.listen.rpc(FindNodeProxyOffer(offers));
        });
    }
    findnodeanswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sdp, peerkid } = data;
            const { kTable } = this.di;
            const peer = kTable.getPeer(peerkid);
            if (!peer)
                return;
            peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
        });
    }
}
exports.default = FindNodeProxy;
//# sourceMappingURL=proxy.js.map