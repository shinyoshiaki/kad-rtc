"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kbucket_1 = tslib_1.__importDefault(require("./kbucket"));
const kad_distance_1 = require("kad-distance");
const sha1_1 = tslib_1.__importDefault(require("sha1"));
class Ktable {
    constructor(kid, opt = {}) {
        this.kid = kid;
        this.kbuckets = [];
        this.k = 20;
        this.getPeer = (kid) => this.allPeers.find(peer => peer.kid === kid);
        this.findNode = (kid) => this.allPeers
            .sort((a, b) => kad_distance_1.distance(a.kid, kid) - kad_distance_1.distance(b.kid, kid))
            .slice(0, this.k);
        this.getHash = (kid) => sha1_1.default(JSON.stringify(this.findNode(kid)
            .map(v => v.kid)
            .sort())).toString();
        const { k } = this;
        const { kBucketSize } = opt;
        this.k = kBucketSize || k;
        this.kbuckets = [...Array(160)].map(() => new kbucket_1.default(opt));
    }
    add(peer) {
        const length = kad_distance_1.distance(this.kid, peer.kid);
        const kbucket = this.kbuckets[length];
        kbucket.add(peer);
    }
    get allPeers() {
        return this.kbuckets
            .map(kbucket => kbucket.peers.map(bucket => bucket.peer))
            .flatMap(item => item);
    }
    get kBucketSize() {
        return this.k;
    }
}
exports.default = Ktable;
//# sourceMappingURL=index.js.map