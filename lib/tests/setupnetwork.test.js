"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = require("../kademlia");
const setupnetwork_1 = require("./setupnetwork");
describe("setup network", () => {
    test("mock", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield setupnetwork_1.testSetupNodes(10, kademlia_1.PeerMockModule, {
            kBucketSize: 8,
            timeout: 60000 * 10
        });
        expect(nodes.length).toBe(10);
    }), 60000 * 5);
    test("webrtc", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield setupnetwork_1.testSetupNodes(10, kademlia_1.PeerModule, {
            kBucketSize: 8,
            timeout: 60000 * 10
        });
        expect(nodes.length).toBe(10);
    }), 60000 * 5);
});
//# sourceMappingURL=setupnetwork.test.js.map