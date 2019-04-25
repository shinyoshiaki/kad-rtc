"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("../../ktable"));
const webrtc_1 = tslib_1.__importStar(require("../../modules/peer/webrtc"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const listen_1 = tslib_1.__importDefault(require("./listen"));
const _1 = tslib_1.__importDefault(require("."));
const kBucketSize = 8;
const num = 4;
describe("findnode", () => {
    test("findnode", async () => {
        const nodes = [];
        const kOffer = new ktable_1.default(sha1_1.default("0").toString(), { kBucketSize });
        const kAnswer = new ktable_1.default(sha1_1.default("1").toString(), { kBucketSize });
        const offer = new webrtc_1.default(kAnswer.kid);
        const offerSdp = await offer.createOffer();
        const answer = new webrtc_1.default(kOffer.kid);
        const answerSdp = await answer.setOffer(offerSdp);
        await offer.setAnswer(answerSdp);
        kOffer.add(offer);
        listen_1.default(webrtc_1.PeerModule, offer, kOffer);
        kAnswer.add(answer);
        listen_1.default(webrtc_1.PeerModule, answer, kAnswer);
        nodes.push(kOffer);
        nodes.push(kAnswer);
        for (let i = 2; i < 2 + num; i++) {
            const pop = nodes.slice(-1)[0];
            const push = new ktable_1.default(sha1_1.default(i.toString()).toString(), { kBucketSize });
            const offer = new webrtc_1.default(push.kid);
            const offerSdp = await offer.createOffer();
            const answer = new webrtc_1.default(pop.kid);
            const answerSdp = await answer.setOffer(offerSdp);
            await offer.setAnswer(answerSdp);
            pop.add(offer);
            listen_1.default(webrtc_1.PeerModule, offer, pop);
            push.add(answer);
            listen_1.default(webrtc_1.PeerModule, answer, push);
            nodes.push(push);
        }
        for (let node of nodes) {
            await _1.default(webrtc_1.PeerModule, node.kid, node);
        }
        const search = async (word) => {
            const node = nodes[0];
            let target;
            for (let _ in [...Array(5)]) {
                target = await _1.default(webrtc_1.PeerModule, word, node);
                if (target)
                    break;
            }
            expect(target).not.toBe(undefined);
        };
        for (let word of nodes) {
            if (word.kid === nodes[0].kid)
                continue;
            await search(word.kid);
        }
    }, 1000 * 6000);
});
//# sourceMappingURL=test.js.map