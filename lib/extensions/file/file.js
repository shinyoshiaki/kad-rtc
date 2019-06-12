"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chunkSize = 16000;
function getSliceArrayBuffer(blob) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const r = new FileReader(), blobSlice = File.prototype.slice, chunkNum = Math.ceil(blob.size / chunkSize);
        const job = () => new Promise((resolve, reject) => {
            let currentChunk = 0;
            r.onerror = e => {
                reject(e);
            };
            const chunks = [];
            r.onload = e => {
                const chunk = e.target.result;
                chunks.push(chunk);
                currentChunk++;
                if (currentChunk <= chunkNum) {
                    loadNext();
                }
                else {
                    resolve(chunks);
                }
            };
            function loadNext() {
                const start = currentChunk * chunkSize;
                const end = start + chunkSize >= blob.size ? blob.size : start + chunkSize;
                r.readAsArrayBuffer(blobSlice.call(blob, start, end));
            }
            loadNext();
        });
        return yield job();
    });
}
exports.getSliceArrayBuffer = getSliceArrayBuffer;
//# sourceMappingURL=file.js.map