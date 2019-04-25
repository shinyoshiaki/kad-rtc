"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const kad_distance_1 = require("kad-distance");
const peer_1 = tslib_1.__importDefault(require("../modules/peer"));
class PeerTest extends peer_1.default {
}
describe("ktable", () => {
    const kBucketSize = 4;
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
        [...Array(10)].forEach((_, i) => {
            ktable.add(new PeerTest(sha1_1.default(i.toString()).toString()));
        });
        const peers = ktable.findNode(kid);
        expect(kad_distance_1.distance(kid, peers[0].kid) <
            kad_distance_1.distance(ktable.getAllPeers()[kBucketSize].kid, kid)).toBe(true);
    });
});
//# sourceMappingURL=test.js.map