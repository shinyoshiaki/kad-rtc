"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Kbucket = /** @class */ (function () {
    function Kbucket(opt) {
        if (opt === void 0) { opt = {}; }
        this.k = 20;
        this.peers = [];
        var kBucketSize = opt.kBucketSize;
        var k = this.k;
        this.k = kBucketSize || k;
    }
    Kbucket.prototype.add = function (peer) {
        var _this = this;
        this.peers.push({ kid: peer.kid, peer: peer });
        peer.onDisconnect.subscribe(function () {
            _this.peers = _this.peers.filter(function (find) { return find.kid !== peer.kid; });
        });
        if (this.peers.length > this.k) {
            var discon = this.peers.shift();
            // if (discon) {
            //   discon.peer.disconnect();
            // }
        }
    };
    Object.defineProperty(Kbucket.prototype, "length", {
        get: function () {
            return Object.keys(this.peers).length;
        },
        enumerable: true,
        configurable: true
    });
    return Kbucket;
}());
exports.default = Kbucket;
//# sourceMappingURL=index.js.map