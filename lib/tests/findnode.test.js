"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kademlia_1 = require("../kademlia");
const testtools_1 = require("./testtools");
const kBucketSize = 8;
const num = 10;
describe("findnode", () => {
    const menu = (nodes) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const search = (word) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const node = nodes[0];
            let target;
            let pre = "", tryTimes = 0;
            for (; pre !== node.kTable.getHash(word); pre = node.kTable.getHash(word), tryTimes++) {
                target = yield kademlia_1.findNode(word, node);
                if (target) {
                    break;
                }
            }
            if (!target) {
                const now = node.kTable.getHash(word);
                expect(pre).toBe(now);
            }
            else {
                expect(target).not.toBe(undefined);
            }
        });
        for (let word of nodes.slice(1)) {
            yield search(word.kTable.kid);
        }
        yield new Promise(r => setTimeout(r, 0));
        nodes.forEach(node => node.kTable.allPeers.forEach(peer => peer.disconnect()));
    });
    test("peer", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield testtools_1.testSetupNodes(kBucketSize, num, kademlia_1.PeerModule, 60000 * 10);
        yield menu(nodes);
    }), 1000 * 6000);
    test("mock", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield testtools_1.testSetupNodes(kBucketSize, num, kademlia_1.PeerMockModule, 60000 * 10);
        yield menu(nodes);
    }), 1000 * 6000);
});
//# sourceMappingURL=findnode.test.js.map