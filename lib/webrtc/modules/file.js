"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const chunkSize = 16000;
function getSliceArrayBuffer(blob) {
    const subject = new rxjs_1.Subject();
    const state = subject.asObservable();
    const r = new FileReader(), blobSlice = File.prototype.slice, chunks = Math.ceil(blob.size / chunkSize);
    let currentChunk = 0;
    r.onerror = e => {
        subject.error(e);
    };
    r.onload = e => {
        const chunk = e.target.result;
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
            subject.next(chunk);
        }
        else {
            subject.complete();
        }
    };
    function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= blob.size ? blob.size : start + chunkSize;
        r.readAsArrayBuffer(blobSlice.call(blob, start, end));
    }
    loadNext();
    return state;
}
exports.getSliceArrayBuffer = getSliceArrayBuffer;
class FileShare {
    constructor(peer, label) {
        this.peer = peer;
        this.label = label;
        this.subject = new rxjs_1.Subject();
        this.state = this.subject.asObservable();
        this.chunks = [];
        this.name = "";
        this.size = 0;
        if (!label)
            label = "file";
        console.log({ label });
        peer.onData.subscribe(raw => {
            const { label, data } = raw;
            if (label === this.label) {
                try {
                    const obj = JSON.parse(data);
                    switch (obj.state) {
                        case "start":
                            this.chunks = [];
                            this.name = obj.name;
                            this.size = obj.size;
                            break;
                        case "end":
                            this.subject.next({
                                type: "downloaded",
                                payload: { chunks: this.chunks, name: this.name }
                            });
                            peer.send(JSON.stringify({ state: "complete", name: this.name }), this.label);
                            this.chunks = [];
                            this.name = "";
                            break;
                    }
                }
                catch (error) {
                    this.chunks.push(data);
                    this.subject.next({
                        type: "downloading",
                        payload: { now: this.chunks.length * chunkSize, size: this.size }
                    });
                }
            }
        });
    }
    sendStart(name, size) {
        this.name = name;
        this.peer.send(JSON.stringify({ state: "start", size, name }), this.label);
    }
    sendChunk(chunk) {
        this.peer.send(chunk, this.label);
    }
    sendEnd() {
        this.peer.send(JSON.stringify({ state: "end" }), this.label);
    }
    send(blob) {
        this.sendStart(blob.name, blob.size);
        getSliceArrayBuffer(blob).subscribe(chunk => this.sendChunk(chunk), () => { }, () => {
            this.sendEnd();
        });
    }
}
exports.default = FileShare;
//# sourceMappingURL=file.js.map