"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = require("../kademlia");
const setupnetwork_1 = require("./setupnetwork");
describe("e2e", () => {
    const job = (nodes) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const kadStore = nodes.pop();
        const { item } = yield kadStore.store("test");
        yield new Promise(r => setTimeout(r));
        yield Promise.all(nodes.map((node) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const res = yield node.findValue(item.key);
            expect(res).not.toBeUndefined();
            {
                const { item } = res;
                expect(item.value).toEqual("test");
            }
        })));
        expect(true).toBe(true);
    });
    test("mock", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield setupnetwork_1.testSetupNodes(10, kademlia_1.PeerMockModule, { timeout: 60000 });
        yield job(nodes);
    }), 600000);
    test("webrtc", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield setupnetwork_1.testSetupNodes(10, kademlia_1.PeerModule, { timeout: 60000 });
        yield job(nodes);
    }), 600000);
});
//# sourceMappingURL=e2e.test.js.map