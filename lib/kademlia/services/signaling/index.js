"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class Signaling {
    constructor(peerCreate) {
        this.peerCreate = peerCreate;
        this.candidates = {};
    }
    exist(kid) {
        return Object.keys(this.candidates).includes(kid);
    }
    delete(kid) {
        delete this.candidates[kid];
    }
    create(kid) {
        if (this.exist(kid)) {
            return { candidate: this.candidates[kid] };
        }
        else {
            const event = new rx_mini_1.default();
            const peer = this.peerCreate(kid);
            this.candidates[kid] = { event, peer };
            peer.onConnect.once(() => {
                event.execute(peer);
                this.delete(kid);
            });
            return { peer };
        }
    }
}
exports.default = Signaling;
//# sourceMappingURL=index.js.map