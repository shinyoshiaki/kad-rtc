"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const listen_1 = tslib_1.__importDefault(require("./listen"));
const FindNode = (searchkid, except) => {
    return { rpc: "findnode", searchkid, except };
};
const FindNodeAnswer = (sdp, peerkid) => {
    return { rpc: "findnodeanswer", sdp, peerkid };
};
async function findNode(module, searchkid, ktable) {
    for (let peer of ktable.findNode(searchkid)) {
        const except = ktable.allPeers.map(item => item.kid);
        const rpc = peer.rpc(FindNode(searchkid, except));
        const res = await rpc.asPromise();
        if (res.rpc === "FindNodeProxyOffer") {
            const offers = res.peers;
            if (offers.length === 0)
                continue;
            for (let offer of offers) {
                const { peerkid, sdp } = offer;
                const connect = module(peerkid);
                const answer = await connect.setOffer(sdp);
                peer.rpc(FindNodeAnswer(answer, peerkid));
                await connect.onConnect.asPromise();
                ktable.add(connect);
                listen_1.default(module, connect, ktable);
            }
        }
    }
    return ktable.getPeer(searchkid);
}
exports.default = findNode;
//# sourceMappingURL=index.js.map