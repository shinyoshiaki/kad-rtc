"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mock_1 = require("./mock");
const testtools_1 = require("../../../utill/testtools");
describe("mock", () => {
    test("test", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const test = () => new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const count = new testtools_1.Count(2, resolve);
            const a = mock_1.PeerModule("a");
            const b = mock_1.PeerModule("b");
            const offer = yield a.createOffer();
            const answer = yield b.setOffer(offer);
            a.setAnswer(answer);
            a.onConnect.once(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const data = { rpc: "a", msg: "a" };
                a.rpc(data);
                const res = yield a.eventRpc("b").asPromise();
                expect(res.msg).toBe("b");
                count.check();
            }));
            b.onConnect.once(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const data = { rpc: "b", msg: "b" };
                b.rpc(data);
                const res = yield b.eventRpc("a").asPromise();
                expect(res.msg).toBe("a");
                count.check();
            }));
        }));
        yield test();
    }), 1000 * 6000);
});
//# sourceMappingURL=mock.test.js.map