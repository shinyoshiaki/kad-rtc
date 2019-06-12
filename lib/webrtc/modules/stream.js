"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("../core"));
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["video"] = 0] = "video";
    MediaType[MediaType["audio"] = 1] = "audio";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
class Stream {
    constructor(peer, opt = {}) {
        this.peer = peer;
        this.opt = opt;
        this.onStream = new rx_mini_1.default();
        this.onLocalStream = new rx_mini_1.default();
        this.initDone = false;
        this.label = opt.label || "stream";
        this.listen();
    }
    listen() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const label = "init_" + this.label;
            const { get, stream, immidiate, track } = this.opt;
            let localStream = stream;
            if (immidiate) {
                this.init({ stream: localStream, track });
            }
            else {
                if (get) {
                    localStream = (yield get.catch(console.log));
                    this.onLocalStream.execute(localStream);
                }
                this.peer.onData.once(raw => {
                    if (raw.label === label && raw.data === "done") {
                        if (!get) {
                            this.init({ stream: localStream, track });
                        }
                    }
                });
                this.peer.send("done", label);
            }
        });
    }
    init(media) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { stream, track } = media;
            if (this.initDone)
                return;
            this.initDone = true;
            const peer = this.peer;
            const newPeer = new core_1.default({ stream, track });
            if (peer.isOffer) {
                newPeer.makeOffer();
                newPeer.onSignal.once(sdp => {
                    peer.send(JSON.stringify(sdp), this.label + "_offer");
                });
                peer.onData.once(raw => {
                    if (raw.label === this.label + "_answer") {
                        newPeer.setSdp(JSON.parse(raw.data));
                    }
                });
            }
            else {
                peer.onData.once(raw => {
                    if (raw.label === this.label + "_offer") {
                        newPeer.setSdp(JSON.parse(raw.data));
                        newPeer.onSignal.once(sdp => {
                            peer.send(JSON.stringify(sdp), this.label + "_answer");
                        });
                    }
                });
            }
            newPeer.onAddTrack.once(stream => {
                this.onStream.execute(stream);
            });
        });
    }
}
exports.default = Stream;
//# sourceMappingURL=stream.js.map