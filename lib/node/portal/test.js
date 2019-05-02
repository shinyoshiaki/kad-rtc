"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
const testtools_1 = require("../../utill/testtools");
const aport_1 = tslib_1.__importDefault(require("aport"));
const kBucketSize = 4;
const num = 8;
function testSetupNodes(kBucketSize, num) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = [];
        const firstport = yield aport_1.default();
        const first = new _1.default({ port: firstport });
        nodes.push(first);
        for (let i = 1, port = firstport; i < num; i++) {
            const newport = yield aport_1.default();
            const node = new _1.default({
                target: { url: "localhost", port },
                port: newport,
                kadOption: { kBucketSize }
            });
            yield node.onConnect.asPromise();
            nodes.push(node);
            port = newport;
        }
        return nodes;
    });
}
describe("portal", () => {
    test("p2p", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const test = () => new Promise(resolve => {
            const a = new _1.default({ port: 50000 });
            const b = new _1.default({
                port: 50001,
                target: { port: 50000, url: "localhost" }
            });
            const count = new testtools_1.Count(2, () => {
                resolve({ a, b });
            });
            a.onConnect.once(() => {
                count.check();
            });
            b.onConnect.once(() => {
                count.check();
            });
        });
        const { a, b } = yield test();
        expect(a.kademlia.di.kTable.getPeer(b.kid)).not.toBe(undefined);
        a.close();
        b.close();
    }), 1000 * 6000);
    test("findnode", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = yield testSetupNodes(kBucketSize, num);
        const search = (word) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const node = nodes[0];
            const res = yield node.kademlia.findNode(word);
            if (!res) {
                res;
            }
            expect(res).not.toBe(undefined);
        });
        for (let node of nodes.slice(1)) {
            yield search(node.kademlia.di.kTable.kid);
        }
        nodes.forEach(node => {
            node.close();
        });
    }), 1000 * 6000);
});
//# sourceMappingURL=test.js.map