"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var keypair_1 = tslib_1.__importDefault(require("keypair"));
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var Buffer = require("buffer/").Buffer;
var Cypher = /** @class */ (function () {
    function Cypher(secKey, pubKey) {
        if (secKey && pubKey) {
            this.secKey = secKey;
            this.pubKey = pubKey;
        }
        else {
            var pair = keypair_1.default();
            this.secKey = pair.private;
            this.pubKey = pair.public;
        }
    }
    Cypher.prototype.encrypt = function (raw) {
        var encrypted = crypto_1.default.privateEncrypt(this.secKey, new Buffer.from(raw));
        return encrypted.toString("base64");
    };
    Cypher.prototype.decrypt = function (encrypted, publicKey) {
        var decrypted = crypto_1.default.publicDecrypt(publicKey, new Buffer.from(encrypted, "base64"));
        return decrypted.toString("utf8");
    };
    return Cypher;
}());
exports.default = Cypher;
//# sourceMappingURL=cypher.js.map