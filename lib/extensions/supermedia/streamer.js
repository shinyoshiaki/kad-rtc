"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const const_1 = require("./const");
const media_1 = require("../media/media");
class SuperStreamVideo {
    constructor() {
        this.onChunks = new rx_mini_1.default();
    }
    recordInterval(stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let chunks = [];
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: const_1.mimeType,
                videoBitsPerSecond: 128000
            });
            mediaRecorder.ondataavailable = ({ data: blob }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const buf = (yield media_1.readAsArrayBuffer(blob));
                if (buf) {
                    chunks.push(buf);
                    if (chunks.length === 10) {
                        this.onChunks.execute(chunks);
                        chunks = [];
                    }
                }
            });
            mediaRecorder.start(const_1.interval);
            setTimeout(() => {
                mediaRecorder.stop();
            }, 60 * 1000 * 10);
        });
    }
    streamViaKad(stream, onHeader, kad) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.recordInterval(stream);
            let buffer = yield this.onChunks.asPromise();
            onHeader(const_1.torrent2hash(const_1.abs2torrent(buffer)));
            this.onChunks.subscribe(abs => {
                const torrent = const_1.abs2torrent(buffer);
                const key = const_1.torrent2hash(torrent);
                const value = JSON.stringify(torrent);
                const msg = const_1.torrent2hash(const_1.abs2torrent(abs));
                kad.store(key, value, msg);
                torrent.map(item => {
                    const ab = buffer[item.i];
                    kad.store(item.v, Buffer.from(ab));
                });
                buffer = abs;
            });
        });
    }
}
exports.default = SuperStreamVideo;
//# sourceMappingURL=streamer.js.map