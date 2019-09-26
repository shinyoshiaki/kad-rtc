"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importStar(require("rx.mini"));
class RenderArraybuffer {
    constructor(kad) {
        this.kad = kad;
        this.torrents = [];
        this.observer = new rx_mini_1.default();
        this.buffer = rx_mini_1.Buffer(10, this.observer);
        this.getVideo = (headerKey) => {
            const { kad } = this;
            const getTorrent = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const first = yield kad.findValue(headerKey);
                if (!first)
                    return;
                for (let { item } = first, bufMsg = headerKey, retry = 0; retry < 20;) {
                    if (!item.msg)
                        break;
                    if (item.msg !== bufMsg) {
                        const torrent = JSON.parse(item.value);
                        this.torrents.push(torrent);
                        bufMsg = item.msg;
                    }
                    const next = yield kad.findValue(item.msg);
                    console.log(item.msg, { next });
                    if (!next) {
                        console.log("fail next", { retry });
                        retry++;
                        if (this.torrents.length === 0)
                            yield new Promise(r => setTimeout(r, 100 * retry));
                        else
                            yield new Promise(r => setTimeout(r, 4000));
                        continue;
                    }
                    else {
                        item = next.item;
                        retry = 0;
                    }
                }
            });
            getTorrent();
            this.getChunks();
        };
        this.getChunks = () => {
            const { kad, torrents } = this;
            const caches = {};
            const playList = [];
            const find = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                findloop: while (true) {
                    const torrentBlocks = torrents.shift();
                    if (!torrentBlocks) {
                        yield new Promise(r => setTimeout(r, 10));
                        continue;
                    }
                    playList.push(torrentBlocks);
                    for (let torrent of torrentBlocks) {
                        const { v } = torrent;
                        let { item } = (yield kad.findValue(v));
                        if (!item) {
                            for (let retry = 0; retry < 20; retry++) {
                                item = (yield kad.findValue(v)).item;
                                if (item) {
                                    break;
                                }
                                else {
                                    console.log("fail chunk", retry);
                                    yield new Promise(r => setTimeout(r, 100 * retry));
                                }
                            }
                        }
                        if (!item) {
                            console.error("broken");
                            break findloop;
                        }
                        else {
                            caches[v] = item.value;
                        }
                    }
                }
            });
            find();
            const seek = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (let torrent;;) {
                    yield new Promise(r => setTimeout(r, 10));
                    if (!torrent)
                        torrent = playList.shift();
                    if (!torrent)
                        continue;
                    const unexist = torrent.some(item => !Object.keys(caches).includes(item.v));
                    if (unexist) {
                        continue;
                    }
                    else {
                        torrent
                            .sort((a, b) => a.i - b.i)
                            .forEach(item => {
                            const chunk = caches[item.v];
                            this.observer.execute(chunk);
                        });
                        torrent = undefined;
                    }
                }
            });
            seek();
        };
    }
}
exports.default = RenderArraybuffer;
//# sourceMappingURL=renderer.js.map