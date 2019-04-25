"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
const FindNodePeerOffer = (sdp, peerkid) => {
    return { rpc: "FindNodePeerOffer", sdp, peerkid };
};
class FindNodePeer {
    constructor(module, listen, ktable) {
        this.module = module;
        this.listen = listen;
        this.ktable = ktable;
        this.signaling = {};
        const discon = listen.onRpc.subscribe(async (data) => {
            switch (data.rpc) {
                case "FindNodeProxyOpen":
                    this.findNodeProxyOpen(data);
                    break;
                case "FindNodeProxyAnswer":
                    this.findNodeProxyAnswer(data);
                    break;
            }
        });
        listen.onDisconnect.once(() => discon.unSubscribe());
    }
    async findNodeProxyOpen(data) {
        const { finderkid } = data;
        const peer = this.module(finderkid);
        this.signaling[finderkid] = peer;
        const offer = await peer.createOffer();
        this.listen.rpc(FindNodePeerOffer(offer, this.ktable.kid));
    }
    async findNodeProxyAnswer(data) {
        const { finderkid, sdp } = data;
        const peer = this.signaling[finderkid];
        if (!peer)
            return;
        await peer.setAnswer(sdp);
        this.ktable.add(peer);
        _1.default(this.module, peer, this.ktable);
    }
}
exports.default = FindNodePeer;
//# sourceMappingURL=peer.js.map