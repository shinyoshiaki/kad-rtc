"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const media_1 = require("../media/media");
const const_1 = require("./const");
class SuperReceiveVideo extends media_1.Media {
    constructor(kad) {
        super();
        this.kad = kad;
        this.torrents = [];
    }
    getVideo(headerKey, onMsReady) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kad } = this;
            const ms = new MediaSource();
            onMsReady(ms);
            yield media_1.waitEvent(ms, "sourceopen", undefined);
            this.sb = ms.addSourceBuffer(const_1.mimeType);
            const getTorrent = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const first = yield kad.findValue(headerKey);
                if (!first)
                    return;
                for (let item = first, bufMsg = headerKey, retry = 0; retry < 20;) {
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
                        item = next;
                        retry = 0;
                    }
                }
            });
            getTorrent();
            this.getChunks();
        });
    }
    getChunks() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { kad, torrents } = this;
            let start = false;
            const caches = {};
            const playList = [];
            const find = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                findloop: while (true) {
                    if (this.chunks.length > (1000 / const_1.interval) * 10) {
                        if (!start) {
                            start = true;
                            this.update(this.sb);
                        }
                    }
                    const torrent = torrents.shift();
                    if (!torrent) {
                        yield new Promise(r => setTimeout(r, 10));
                        continue;
                    }
                    playList.push(torrent);
                    for (let item of torrent) {
                        const { v } = item;
                        let chunk = yield kad.findValue(v);
                        if (!chunk) {
                            for (let retry = 0; retry < 20; retry++) {
                                chunk = yield kad.findValue(v);
                                if (chunk) {
                                    break;
                                }
                                else {
                                    console.log("fail chunk", retry);
                                    yield new Promise(r => setTimeout(r, 100 * retry));
                                }
                            }
                        }
                        if (!chunk) {
                            console.error("broken");
                            break findloop;
                        }
                        else {
                            caches[v] = chunk.value;
                        }
                    }
                }
            });
            find();
            const seek = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (let torrent;;) {
                    yield new Promise(r => setTimeout(r, 1000));
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
                            this.chunks.push(chunk);
                        });
                        torrent = undefined;
                    }
                }
            });
            seek();
        });
    }
}
exports.default = SuperReceiveVideo;
//# sourceMappingURL=renderer.js.map