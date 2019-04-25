"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kbucket_1 = tslib_1.__importDefault(require("./kbucket"));
const kad_distance_1 = require("kad-distance");
class Ktable {
    constructor(kid, opt = {}) {
        this.kid = kid;
        this.kbuckets = [];
        this.k = 20;
        this.getAllPeers = () => this.kbuckets
            .map(kbucket => kbucket.peers.map(bucket => bucket.peer))
            .flatMap(item => item);
        this.getPeer = (kid) => this.getAllPeers().find(peer => peer.kid === kid);
        this.findNode = (kid) => this.getAllPeers()
            .sort((a, b) => kad_distance_1.distance(a.kid, kid) - kad_distance_1.distance(b.kid, kid))
            .slice(0, this.k);
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
}
exports.default = Ktable;
//# sourceMappingURL=index.js.map