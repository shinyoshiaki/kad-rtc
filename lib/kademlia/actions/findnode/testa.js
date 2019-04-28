"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mock_1 = tslib_1.__importStar(require("../../modules/peer/mock"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const _1 = tslib_1.__importDefault(require("."));
const di_1 = require("../../di");
const listeners_1 = require("../../listeners");
const kBucketSize = 8;
const num = 5;
function testSetupNodes(kBucketSize, num) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        const kOffer = di_1.dependencyInjection(sha1_1.default("0").toString(), mock_1.PeerModule, {
            kBucketSize
        });
        const kAnswer = di_1.dependencyInjection(sha1_1.default("1").toString(), mock_1.PeerModule, {
            kBucketSize
        });
        const offer = new mock_1.default(kAnswer.kTable.kid);
        const offerSdp = yield offer.createOffer();
        const answer = new mock_1.default(kOffer.kTable.kid);
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
            const push = di_1.dependencyInjection(sha1_1.default(i.toString()).toString(), mock_1.PeerModule, { kBucketSize });
            const offer = new mock_1.default(push.kTable.kid);
            const offerSdp = yield offer.createOffer();
            const answer = new mock_1.default(pop.kTable.kid);
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
            let trytime = 0;
            for (let pre = "";; trytime++) {
                const res = yield _1.default(word, node);
                if (pre === res.hash) {
                    break;
                }
                if (res.target) {
                    target = res.target;
                    break;
                }
                pre = res.hash;
            }
            if (!target) {
                expect(true).toBe(true);
            }
            expect(target).not.toBe(undefined);
        });
        for (let word of nodes.slice(1)) {
            yield search(word.kTable.kid);
        }
        yield new Promise(r => setTimeout(r, 0));
    }), 1000 * 6000);
});
//# sourceMappingURL=testa.js.map