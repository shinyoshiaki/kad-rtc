"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var chunkSize = 16000;
function getSliceArrayBuffer(blob) {
    var subject = new rxjs_1.Subject();
    var state = subject.asObservable();
    var r = new FileReader(), blobSlice = File.prototype.slice, chunks = Math.ceil(blob.size / chunkSize);
    var currentChunk = 0;
    r.onerror = function (e) {
        subject.error(e);
    };
    r.onload = function (e) {
        var chunk = e.target.result;
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
        var start = currentChunk * chunkSize;
        var end = start + chunkSize >= blob.size ? blob.size : start + chunkSize;
        r.readAsArrayBuffer(blobSlice.call(blob, start, end));
    }
    loadNext();
    return state;
}
exports.getSliceArrayBuffer = getSliceArrayBuffer;
var FileShare = /** @class */ (function () {
    function FileShare(peer, label) {
        var _this = this;
        this.peer = peer;
        this.label = label;
        this.subject = new rxjs_1.Subject();
        this.state = this.subject.asObservable();
        this.chunks = [];
        this.name = "";
        this.size = 0;
        if (!label)
            label = "file";
        console.log({ label: label });
        peer.onData.subscribe(function (raw) {
            var label = raw.label, data = raw.data;
            if (label === _this.label) {
                try {
                    var obj = JSON.parse(data);
                    switch (obj.state) {
                        case "start":
                            _this.chunks = [];
                            _this.name = obj.name;
                            _this.size = obj.size;
                            break;
                        case "end":
                            _this.subject.next({
                                type: "downloaded",
                                payload: { chunks: _this.chunks, name: _this.name }
                            });
                            peer.send(JSON.stringify({ state: "complete", name: _this.name }), _this.label);
                            _this.chunks = [];
                            _this.name = "";
                            break;
                    }
                }
                catch (error) {
                    _this.chunks.push(data);
                    _this.subject.next({
                        type: "downloading",
                        payload: { now: _this.chunks.length * chunkSize, size: _this.size }
                    });
                }
            }
        });
    }
    FileShare.prototype.sendStart = function (name, size) {
        this.name = name;
        this.peer.send(JSON.stringify({ state: "start", size: size, name: name }), this.label);
    };
    FileShare.prototype.sendChunk = function (chunk) {
        this.peer.send(chunk, this.label);
    };
    FileShare.prototype.sendEnd = function () {
        this.peer.send(JSON.stringify({ state: "end" }), this.label);
    };
    FileShare.prototype.send = function (blob) {
        var _this = this;
        this.sendStart(blob.name, blob.size);
        getSliceArrayBuffer(blob).subscribe(function (chunk) { return _this.sendChunk(chunk); }, function () { }, function () {
            _this.sendEnd();
        });
    };
    return FileShare;
}());
exports.default = FileShare;
//# sourceMappingURL=file.js.map