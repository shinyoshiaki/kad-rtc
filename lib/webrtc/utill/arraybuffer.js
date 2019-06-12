"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sliceArraybuffer(arrayBuffer, segmentSize) {
    const segments = [];
    let fi = 0;
    while (fi * segmentSize < arrayBuffer.byteLength) {
        segments.push(arrayBuffer.slice(fi * segmentSize, (fi + 1) * segmentSize));
        ++fi;
    }
    return segments;
}
exports.sliceArraybuffer = sliceArraybuffer;
function mergeArraybuffer(segments) {
    let sumLength = 0;
    for (let i = 0; i < segments.length; ++i) {
        sumLength += segments[i].byteLength;
    }
    let whole = new Uint8Array(sumLength);
    let pos = 0;
    for (let i = 0; i < segments.length; ++i) {
        whole.set(new Uint8Array(segments[i]), pos);
        pos += segments[i].byteLength;
    }
    return whole.buffer;
}
exports.mergeArraybuffer = mergeArraybuffer;
exports.blob2Arraybuffer = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = e => reject(e);
    r.onload = e => resolve(e.target.result);
    r.readAsArrayBuffer(blob);
});
//# sourceMappingURL=arraybuffer.js.map