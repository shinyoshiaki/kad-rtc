"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const media_1 = require("./media");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const interval = 500;
const mimeType = `video/webm; codecs="opus,vp9"`;
class StreamVideo extends media_1.Media {
    recordInterval(stream, eventChunk, onMsReady) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 128000
            });
            const ms = new MediaSource();
            onMsReady(ms);
            yield media_1.waitEvent(ms, "sourceopen", undefined);
            const sb = ms.addSourceBuffer(mimeType);
            mediaRecorder.ondataavailable = ({ data: blob }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const buf = (yield media_1.readAsArrayBuffer(blob));
                if (buf) {
                    this.chunks.push(buf);
                    eventChunk.execute(Buffer.from(buf));
                }
            });
            mediaRecorder.start(interval);
            this.update(sb);
            setTimeout(() => {
                mediaRecorder.stop();
            }, 60 * 1000 * 10);
        });
    }
    streamViaKad(stream, onHeader, onMs, kad) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const record = new rx_mini_1.default();
            this.recordInterval(stream, record, ms => {
                onMs(ms);
            });
            let buffer = yield record.asPromise();
            const hash = (ab) => sha1_1.default(Buffer.from(ab)).toString();
            const key = hash(buffer);
            onHeader(key);
            const chunks = [];
            record.subscribe((ab) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                chunks.push(ab);
            }));
            while (true) {
                const ab = chunks.shift();
                if (ab) {
                    if (ab.byteLength > 16000) {
                        console.warn("to large", ab.byteLength);
                    }
                    const key = hash(buffer);
                    const data = buffer;
                    const msg = hash(ab);
                    kad.store(key, data, msg);
                    buffer = ab;
                }
                else {
                    yield new Promise(r => setTimeout(r, 0));
                }
            }
        });
    }
}
exports.StreamVideo = StreamVideo;
class ReceiveVideo extends media_1.Media {
    getVideo(headerKey, onMsReady, kad) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ms = new MediaSource();
            onMsReady(ms);
            yield media_1.waitEvent(ms, "sourceopen", undefined);
            const sb = ms.addSourceBuffer(mimeType);
            const first = yield kad.findValue(headerKey);
            console.log({ first });
            if (!first)
                return;
            const work = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    for (let item = first, buf = headerKey, start = false, retry = 0; retry < 20;) {
                        if (this.chunks.length > (1000 / interval) * 10) {
                            if (!start) {
                                start = true;
                                this.update(sb);
                            }
                        }
                        if (!item.msg) {
                            console.warn("file format error");
                            break;
                        }
                        if (item.msg !== buf) {
                            this.chunks.push(item.value.buffer);
                            buf = item.msg;
                        }
                        const next = yield kad.findValue(item.msg);
                        console.log(item.msg, { next });
                        if (!next) {
                            console.log("fail next", { retry });
                            retry++;
                            yield new Promise(r => setTimeout(r, 100 * retry));
                            continue;
                        }
                        else {
                            item = next;
                            if (retry > 0)
                                retry--;
                        }
                    }
                }
                catch (error) {
                    console.log(error);
                }
            });
            if (first) {
                yield work().catch(console.error);
            }
        });
    }
}
exports.ReceiveVideo = ReceiveVideo;
//# sourceMappingURL=index.js.map