"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = require("../kademlia");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
class Count {
    constructor(times, resolve) {
        this.times = times;
        this.resolve = resolve;
        this.count = 0;
        this.check = () => {
            this.count++;
            if (this.count === this.times)
                this.resolve();
        };
    }
}
exports.Count = Count;
function testSetupNodes(kBucketSize, num, PeerModule, timeout) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        for (let i = 0; i < num; i++) {
            if (nodes.length === 0) {
                const node = kademlia_1.dependencyInjection(sha1_1.default(i.toString()).toString(), { peerCreate: PeerModule, kvs: new kademlia_1.KeyValueStore() }, { kBucketSize, timeout });
                nodes.push(node);
            }
            else {
                const pre = nodes.slice(-1)[0];
                const push = kademlia_1.dependencyInjection(sha1_1.default(i.toString()).toString(), { peerCreate: PeerModule, kvs: new kademlia_1.KeyValueStore() }, { kBucketSize, timeout });
                const offer = PeerModule(push.kTable.kid);
                const offerSdp = yield offer.createOffer();
                const answer = PeerModule(pre.kTable.kid);
                const answerSdp = yield answer.setOffer(offerSdp);
                yield offer.setAnswer(answerSdp);
                kademlia_1.listeners(offer, pre);
                kademlia_1.listeners(answer, push);
                nodes.push(push);
            }
        }
        for (let node of nodes) {
            yield kademlia_1.findNode(node.kTable.kid, node);
        }
        return nodes;
    });
}
exports.testSetupNodes = testSetupNodes;
//# sourceMappingURL=testtools.js.map