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
    constructor(listen, ktable) {
        this.listen = listen;
        this.ktable = ktable;
        const discon = listen.onRpc.subscribe((data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (data.rpc) {
                case "findnode":
                    this.findnode(data);
                    break;
                case "findnodeanswer":
                    this.findnodeanswer(data);
                    break;
            }
        }));
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    findnode(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { searchkid, except } = data;
            const peers = this.ktable.findNode(searchkid);
            const offers = [];
            for (let peer of peers) {
                if (peer.kid === this.listen.kid)
                    continue;
                if (except.includes(peer.kid))
                    continue;
                const rpc = peer.rpc(FindNodeProxyOpen(this.listen.kid));
                const res = yield rpc.asPromise();
                if (res.rpc === "FindNodePeerOffer") {
                    const { peerkid, sdp } = res;
                    offers.push({ peerkid, sdp });
                }
            }
            this.listen.rpc(FindNodeProxyOffer(offers));
        });
    }
    findnodeanswer(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sdp, peerkid } = data;
            const peer = this.ktable.getPeer(peerkid);
            if (!peer)
                return;
            peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
        });
    }
}
exports.default = FindNodeProxy;
//# sourceMappingURL=proxy.js.map