"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const const_1 = require("./const");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class StreamArraybuffer {
    constructor() {
        this.chunks = [];
        this.onChunks = new rx_mini_1.default();
        this.addAb = (uint8) => {
            this.chunks.push(uint8);
            if (this.chunks.length > 10) {
                this.onChunks.execute(this.chunks);
                this.chunks = [];
            }
        };
        this.streamViaKad = (kad, onHeader) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let buffer = yield this.onChunks.asPromise();
            onHeader(const_1.torrent2hash(const_1.abs2torrent(buffer)));
            this.onChunks.subscribe(abs => {
                const torrent = const_1.abs2torrent(buffer);
                const value = JSON.stringify(torrent);
                const msg = const_1.torrent2hash(const_1.abs2torrent(abs));
                kad.store(value, msg);
                torrent.map(item => {
                    const uint8 = buffer[item.i];
                    kad.store(uint8);
                });
                buffer = abs;
            });
        });
    }
}
exports.default = StreamArraybuffer;
//# sourceMappingURL=streamer.js.map