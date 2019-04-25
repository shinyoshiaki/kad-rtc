"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var kbucket_1 = tslib_1.__importDefault(require("./kbucket"));
var kad_distance_1 = require("kad-distance");
var Ktable = /** @class */ (function () {
    function Ktable(kid, opt) {
        var _this = this;
        if (opt === void 0) { opt = {}; }
        this.kid = kid;
        this.kbuckets = [];
        this.k = 20;
        this.getAllPeers = function () {
            return _this.kbuckets
                .map(function (kbucket) { return kbucket.peers.map(function (bucket) { return bucket.peer; }); })
                .flatMap(function (item) { return item; });
        };
        this.getPeer = function (kid) {
            return _this.getAllPeers().find(function (peer) { return peer.kid === kid; });
        };
        this.findNode = function (kid) {
            return _this.getAllPeers()
                .sort(function (a, b) { return kad_distance_1.distance(a.kid, kid) - kad_distance_1.distance(b.kid, kid); })
                .slice(0, _this.k);
        };
        var k = this.k;
        var kBucketSize = opt.kBucketSize;
        this.k = kBucketSize || k;
        this.kbuckets = Array(160).slice().map(function () { return new kbucket_1.default(opt); });
    }
    Ktable.prototype.add = function (peer) {
        var length = kad_distance_1.distance(this.kid, peer.kid);
        var kbucket = this.kbuckets[length];
        kbucket.add(peer);
    };
    Object.defineProperty(Ktable.prototype, "allPeers", {
        get: function () {
            return this.kbuckets
                .map(function (kbucket) { return kbucket.peers.map(function (bucket) { return bucket.peer; }); })
                .flatMap(function (item) { return item; });
        },
        enumerable: true,
        configurable: true
    });
    return Ktable;
}());
exports.default = Ktable;
//# sourceMappingURL=index.js.map