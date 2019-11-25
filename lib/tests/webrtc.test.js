"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = require("../kademlia");
const testtools_1 = require("./testtools");
describe("webrtc", () => {
    test("test", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((resolve) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const count = new testtools_1.Count(2, () => {
                a.disconnect();
                b.disconnect();
                resolve();
            });
            const uuid = new kademlia_1.Uuid();
            const a = kademlia_1.PeerModule("a");
            const b = kademlia_1.PeerModule("b");
            a.onConnect.once(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const data = { type: "a", msg: "a", id: uuid.get() };
                a.rpc(data);
                a.onRpc.once(v => {
                    const { msg } = v;
                    if (v.type === "b") {
                        expect(msg).toBe("b");
                        count.check();
                    }
                });
            }));
            b.onConnect.once(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const data = { type: "b", msg: "b", id: uuid.get() };
                b.rpc(data);
                b.onRpc.once(v => {
                    const { msg } = v;
                    if (v.type === "a") {
                        expect(msg).toBe("a");
                        count.check();
                    }
                });
            }));
            const offer = yield a.createOffer();
            const answer = yield b.setOffer(offer);
            a.setAnswer(answer);
        }));
    }), 10000);
});
//# sourceMappingURL=webrtc.test.js.map