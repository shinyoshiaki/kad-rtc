import keypair from "keypair";
import crypto from "crypto";
const Buffer = require("buffer/").Buffer;

export default class Cypher {
  secKey: string;
  pubKey: string;
  constructor(secKey?: string, pubKey?: string) {
    if (secKey && pubKey) {
      this.secKey = secKey;
      this.pubKey = pubKey;
    } else {
      const pair = keypair();
      this.secKey = pair.private;
      this.pubKey = pair.public;
    }
  }

  encrypt(raw: string) {
    const encrypted = crypto.privateEncrypt(this.secKey, new Buffer.from(raw));
    return encrypted.toString("base64");
  }

  decrypt(encrypted: string, publicKey: string) {
    const decrypted = crypto.publicDecrypt(
      publicKey,
      new Buffer.from(encrypted, "base64")
    );
    return decrypted.toString("utf8");
  }
}
