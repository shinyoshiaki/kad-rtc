"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var _1 = tslib_1.__importDefault(require("."));
var sha1_1 = tslib_1.__importDefault(require("sha1"));
var kad_distance_1 = require("kad-distance");
var peer_1 = tslib_1.__importDefault(require("../modules/peer"));
var PeerTest = /** @class */ (function (_super) {
    tslib_1.__extends(PeerTest, _super);
    function PeerTest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PeerTest;
}(peer_1.default));
describe("ktable", function () {
    var kBucketSize = 4;
    test("constructor", function () {
        var ktable = new _1.default(sha1_1.default("a").toString(), { kBucketSize: kBucketSize });
        var kbuckets = ktable.kbuckets;
        var k = ktable.k;
        expect(kbuckets.length).toBe(160);
        expect(k).toBe(kBucketSize);
    });
    test("findnode", function () {
        var ktable = new _1.default(sha1_1.default("a").toString(), { kBucketSize: kBucketSize });
        var kid = ktable.kid;
        Array(10).slice().forEach(function (_, i) {
            ktable.add(new PeerTest(sha1_1.default(i.toString()).toString()));
        });
        var peers = ktable.findNode(kid);
        expect(kad_distance_1.distance(kid, peers[0].kid) <
            kad_distance_1.distance(ktable.getAllPeers()[kBucketSize].kid, kid)).toBe(true);
    });
});
//# sourceMappingURL=test.js.map