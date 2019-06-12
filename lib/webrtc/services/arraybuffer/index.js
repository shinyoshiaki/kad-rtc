"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arraybuffer_1 = require("../../utill/arraybuffer");
class ArrayBufferService {
    constructor() {
        this.label = "w4me_file";
        this.origin = "datachannel";
        this.memory = [];
    }
    listen(peer) {
        peer.onData.subscribe(msg => {
            if (msg.label === this.label) {
                const data = msg.data;
                if (typeof data === "string") {
                    const ab = arraybuffer_1.mergeArraybuffer(this.memory);
                    peer.onData.execute({
                        label: msg.data,
                        data: ab,
                        nodeId: peer.nodeId
                    });
                    this.memory = [];
                }
                else {
                    this.memory.push(data);
                }
            }
        });
    }
    send(ab, origin, rtc) {
        this.origin = origin;
        console.log(this.origin, origin);
        const chunks = arraybuffer_1.sliceArraybuffer(ab, 16000);
        for (let chunk of chunks) {
            rtc.send(chunk);
        }
        rtc.send(origin);
    }
}
exports.default = ArrayBufferService;
//# sourceMappingURL=index.js.map