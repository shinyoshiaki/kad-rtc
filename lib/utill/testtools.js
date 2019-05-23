"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const di_1 = require("../kademlia/di");
const __1 = require("..");
const listeners_1 = require("../kademlia/listeners");
const findnode_1 = tslib_1.__importDefault(require("../kademlia/actions/findnode"));
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
function testSetupNodes(kBucketSize, num) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        for (let i = 0; i < num; i++) {
            if (nodes.length === 0) {
                const node = di_1.dependencyInjection(sha1_1.default(i.toString()).toString(), { peerCreate: __1.PeerModule, kvs: __1.KvsModule }, {
                    kBucketSize
                });
                nodes.push(node);
            }
            else {
                const pre = nodes.slice(-1)[0];
                const push = di_1.dependencyInjection(sha1_1.default(i.toString()).toString(), { peerCreate: __1.PeerModule, kvs: __1.KvsModule }, {
                    kBucketSize
                });
                const offer = __1.PeerModule(push.kTable.kid);
                const offerSdp = yield offer.createOffer();
                const answer = __1.PeerModule(pre.kTable.kid);
                const answerSdp = yield answer.setOffer(offerSdp);
                yield offer.setAnswer(answerSdp);
                listeners_1.listeners(offer, pre);
                listeners_1.listeners(answer, push);
                nodes.push(push);
            }
        }
        for (let node of nodes) {
            yield findnode_1.default(node.kTable.kid, node);
        }
        return nodes;
    });
}
exports.testSetupNodes = testSetupNodes;
//# sourceMappingURL=testtools.js.map