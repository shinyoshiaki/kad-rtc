"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const src_1 = require("../../../../src");
function guest(kad, target) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const join = yield axios_1.default.post(target + "/join", {
            kid: kad.kid
        });
        console.log({ join });
        const { kid, offer } = join.data;
        const peer = src_1.PeerModule(kid);
        const answer = yield peer.setOffer(offer);
        const res = yield axios_1.default.post(target + "/answer", {
            kid: kad.kid,
            answer
        });
        if (res) {
            console.log("connected");
        }
    });
}
exports.default = guest;
//# sourceMappingURL=index.js.map