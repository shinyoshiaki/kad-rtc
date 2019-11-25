"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = tslib_1.__importStar(require("../kademlia"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
function testSetupNodes(num, PeerModule, opt) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const modules = () => ({ peerCreate: PeerModule, kvs: new kademlia_1.KeyValueStore() });
        const nodes = [];
        for (let i = 0; i < num; i++) {
            if (nodes.length === 0) {
                const node = new kademlia_1.default(sha1_1.default(i.toString()), modules(), opt);
                nodes.push(node);
            }
            else {
                const pre = nodes.slice(-1)[0];
                const push = new kademlia_1.default(sha1_1.default(i.toString()), modules(), opt);
                const pushOffer = PeerModule(pre.di.kTable.kid);
                const offerSdp = yield pushOffer.createOffer();
                const preAnswer = PeerModule(push.di.kTable.kid);
                const answerSdp = yield preAnswer.setOffer(offerSdp);
                yield pushOffer.setAnswer(answerSdp);
                push.add(pushOffer);
                pre.add(preAnswer);
                yield push.findNode(push.kid);
                yield pre.findNode(pre.kid);
                nodes.push(push);
            }
        }
        return nodes;
    });
}
exports.testSetupNodes = testSetupNodes;
//# sourceMappingURL=setupnetwork.js.map