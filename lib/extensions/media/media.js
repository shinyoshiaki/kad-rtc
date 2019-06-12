"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class Media {
    constructor() {
        this.chunks = [];
        this.stop = true;
    }
    update(sb) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.stop = false;
            while (!this.stop) {
                if (sb.updating || this.chunks.length === 0) {
                    yield new Promise(r => setTimeout(r, 10));
                }
                else {
                    const chunk = this.chunks.shift();
                    try {
                        if (chunk)
                            sb.appendBuffer(chunk);
                        yield waitEvent(sb, "updateend", undefined);
                    }
                    catch (error) {
                        console.warn(error, chunk, sb);
                    }
                }
            }
        });
    }
    stopMedia() {
        this.stop = false;
    }
}
exports.Media = Media;
function waitEvent(target, event, error) {
    return new Promise((resolve, reject) => {
        target.addEventListener(event, _resolve);
        if (typeof error === "string") {
            target.addEventListener(error, _reject);
        }
        function _removeListener() {
            target.removeEventListener(event, _resolve);
            if (typeof error === "string") {
                target.removeEventListener(error, _reject);
            }
        }
        function _resolve(ev) {
            _removeListener();
            resolve(ev);
        }
        function _reject(ev) {
            _removeListener();
            reject(ev);
        }
    });
}
exports.waitEvent = waitEvent;
function readAsArrayBuffer(blob) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        return waitEvent(reader, "loadend", "error").then(() => reader.result);
    });
}
exports.readAsArrayBuffer = readAsArrayBuffer;
//# sourceMappingURL=media.js.map