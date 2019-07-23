"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("../../utill/crypto");
exports.interval = 500;
exports.mimeType = `video/webm; codecs="opus,vp9"`;
exports.abs2torrent = (abs) => abs.map((ab, i) => ({ i, v: crypto_1.abHash(ab) }));
exports.torrent2hash = (torrent) => crypto_1.jsonHash(torrent);
//# sourceMappingURL=const.js.map