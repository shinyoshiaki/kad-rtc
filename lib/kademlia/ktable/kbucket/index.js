"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Kbucket {
    constructor(opt = {}) {
        this.k = 20;
        this.peers = [];
        const { kBucketSize } = opt;
        const { k } = this;
        this.k = kBucketSize || k;
    }
    add(peer) {
        if (this.peers.find(v => v.kid === peer.kid)) {
            this.peers = this.peers.filter(find => find.kid !== peer.kid);
        }
        this.peers.push({ kid: peer.kid, peer });
        if (this.peers.length > this.k) {
            this.peers.shift();
        }
        peer.onDisconnect.once(() => {
            this.rmPeer(peer.kid);
        });
    }
    rmPeer(kid) {
        this.peers = this.peers.filter(find => find.kid !== kid);
    }
    get length() {
        return Object.keys(this.peers).length;
    }
}
exports.default = Kbucket;
//# sourceMappingURL=index.js.map