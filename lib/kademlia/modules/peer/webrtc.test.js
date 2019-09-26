"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webrtc_1 = require("./webrtc");
const testtools_1 = require("../../../utill/testtools");
const uuid_1 = tslib_1.__importDefault(require("../../../utill/uuid"));
describe("webrtc", () => {
    test("test", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const test = () => new Promise((resolve) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const count = new testtools_1.Count(2, () => {
                a.disconnect();
                b.disconnect();
                resolve();
            });
            const uuid = new uuid_1.default();
            const a = webrtc_1.PeerModule("a");
            const b = webrtc_1.PeerModule("b");
            const offer = yield a.createOffer();
            const answer = yield b.setOffer(offer);
            a.setAnswer(answer);
            a.onConnect.once(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const data = { rpc: "a", msg: "a", id: uuid.get() };
                a.rpc(data);
                a.onRpc.once(v => {
                    if (v.rpc === "b") {
                        expect(v.msg).toBe("b");
                        count.check();
                    }
                });
            }));
            b.onConnect.once(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const data = { rpc: "b", msg: "b", id: uuid.get() };
                b.rpc(data);
                b.onRpc.once(v => {
                    if (v.rpc === "a") {
                        expect(v.msg).toBe("a");
                        count.check();
                    }
                });
            }));
        }));
        yield test();
    }), 1000 * 6000);
});
//# sourceMappingURL=webrtc.test.js.map