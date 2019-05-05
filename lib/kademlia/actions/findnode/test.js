"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webrtc_1 = require("../../modules/peer/webrtc");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const _1 = tslib_1.__importDefault(require("."));
const di_1 = require("../../di");
const listeners_1 = require("../../listeners");
const base_1 = require("../../modules/kvs/base");
const kBucketSize = 8;
const num = 10;
function testSetupNodes(kBucketSize, num) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        const kOffer = di_1.dependencyInjection(sha1_1.default("0").toString(), { peerCreate: webrtc_1.PeerModule, kvs: base_1.KvsModule() }, {
            kBucketSize
        });
        const kAnswer = di_1.dependencyInjection(sha1_1.default("1").toString(), { peerCreate: webrtc_1.PeerModule, kvs: base_1.KvsModule() }, {
            kBucketSize
        });
        const offer = webrtc_1.PeerModule(kAnswer.kTable.kid);
        const offerSdp = yield offer.createOffer();
        const answer = webrtc_1.PeerModule(kOffer.kTable.kid);
        const answerSdp = yield answer.setOffer(offerSdp);
        yield offer.setAnswer(answerSdp);
        kOffer.kTable.add(offer);
        listeners_1.listeners(offer, kOffer);
        kAnswer.kTable.add(answer);
        listeners_1.listeners(answer, kAnswer);
        nodes.push(kOffer);
        nodes.push(kAnswer);
        for (let i = 2; i < 2 + num; i++) {
            const pop = nodes.slice(-1)[0];
            const push = di_1.dependencyInjection(sha1_1.default(i.toString()).toString(), { peerCreate: webrtc_1.PeerModule, kvs: base_1.KvsModule() }, { kBucketSize });
            const offer = webrtc_1.PeerModule(push.kTable.kid);
            const offerSdp = yield offer.createOffer();
            const answer = webrtc_1.PeerModule(pop.kTable.kid);
            const answerSdp = yield answer.setOffer(offerSdp);
            yield offer.setAnswer(answerSdp);
            pop.kTable.add(offer);
            listeners_1.listeners(offer, pop);
            push.kTable.add(answer);
            listeners_1.listeners(answer, push);
            nodes.push(push);
        }
        for (let node of nodes) {
            yield _1.default(node.kTable.kid, node);
        }
        return nodes;
    });
}
exports.testSetupNodes = testSetupNodes;
describe("findnode", () => {
    test("findnode", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = yield testSetupNodes(kBucketSize, num);
        const search = (word) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const node = nodes[0];
            let target;
            let pre = "", trytime = 0;
            for (; pre !== node.kTable.getHash(word); pre = node.kTable.getHash(word), trytime++) {
                target = yield _1.default(word, node);
                if (target) {
                    break;
                }
            }
            if (!target) {
                const now = node.kTable.getHash(word);
                expect(pre).toBe(now);
            }
            else {
                expect(target).not.toBe(undefined);
            }
        });
        for (let word of nodes.slice(1)) {
            yield search(word.kTable.kid);
        }
        yield new Promise(r => setTimeout(r, 0));
    }), 1000 * 6000);
});
//# sourceMappingURL=test.js.map