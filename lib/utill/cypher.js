"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const keypair_1 = tslib_1.__importDefault(require("keypair"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const Buffer = require("buffer/").Buffer;
class Cypher {
    constructor(secKey, pubKey) {
        if (secKey && pubKey) {
            this.secKey = secKey;
            this.pubKey = pubKey;
        }
        else {
            const pair = keypair_1.default();
            this.secKey = pair.private;
            this.pubKey = pair.public;
        }
    }
    encrypt(raw) {
        const encrypted = crypto_1.default.privateEncrypt(this.secKey, new Buffer.from(raw));
        return encrypted.toString("base64");
    }
    decrypt(encrypted, publicKey) {
        const decrypted = crypto_1.default.publicDecrypt(publicKey, new Buffer.from(encrypted, "base64"));
        return decrypted.toString("utf8");
    }
}
exports.default = Cypher;
//# sourceMappingURL=cypher.js.map