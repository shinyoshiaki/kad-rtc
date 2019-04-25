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
        this.peers.push({ kid: peer.kid, peer });
        peer.onDisconnect.subscribe(() => {
            this.peers = this.peers.filter(find => find.kid !== peer.kid);
        });
        if (this.peers.length > this.k) {
            const discon = this.peers.shift();
            // if (discon) {
            //   discon.peer.disconnect();
            // }
        }
    }
    get length() {
        return Object.keys(this.peers).length;
    }
}
exports.default = Kbucket;
//# sourceMappingURL=index.js.map