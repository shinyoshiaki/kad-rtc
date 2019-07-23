"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const kad_distance_1 = require("kad-distance");
const base_1 = require("../modules/peer/base");
class PeerTest extends base_1.PeerMock {
}
describe("ktable", () => {
    const kBucketSize = 20;
    test("constructor", () => {
        const ktable = new _1.default(sha1_1.default("a").toString(), { kBucketSize });
        const kbuckets = ktable.kbuckets;
        const k = ktable.k;
        expect(kbuckets.length).toBe(160);
        expect(k).toBe(kBucketSize);
    });
    test("findnode", () => {
        const ktable = new _1.default(sha1_1.default("a").toString(), { kBucketSize });
        const { kid } = ktable;
        [...Array(100)].forEach((_, i) => {
            ktable.add(new PeerTest(sha1_1.default(i.toString()).toString()));
        });
        const peers = ktable.findNode(kid);
        expect(kad_distance_1.distance(kid, peers[0].kid) <
            kad_distance_1.distance(ktable.allPeers.slice(-1)[0].kid, kid)).toBe(true);
    });
});
//# sourceMappingURL=test.js.map