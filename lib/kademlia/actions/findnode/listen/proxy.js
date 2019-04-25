"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const discon = listen.onRpc.subscribe(async (data) => {
            switch (data.rpc) {
                case "findnode":
                    this.findnode(data);
                    break;
                case "findnodeanswer":
                    this.findnodeanswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    async findnode(data) {
        const { searchkid, except } = data;
        const peers = this.ktable.findNode(searchkid);
        const offers = [];
        for (let peer of peers) {
            if (peer.kid === this.listen.kid)
                continue;
            if (except.includes(peer.kid))
                continue;
            const rpc = peer.rpc(FindNodeProxyOpen(this.listen.kid));
            const res = await rpc.asPromise();
            if (res.rpc === "FindNodePeerOffer") {
                const { peerkid, sdp } = res;
                offers.push({ peerkid, sdp });
            }
        }
        this.listen.rpc(FindNodeProxyOffer(offers));
    }
    async findnodeanswer(data) {
        const { sdp, peerkid } = data;
        const peer = this.ktable.getPeer(peerkid);
        if (!peer)
            return;
        peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
    }
}
exports.default = FindNodeProxy;
//# sourceMappingURL=proxy.js.map