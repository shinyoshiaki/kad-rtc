"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
const aport_1 = tslib_1.__importDefault(require("aport"));
const portal_1 = tslib_1.__importDefault(require("../portal"));
const kBucketSize = 4;
const num = 8;
function testSetupNodes(kBucketSize, num) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const portalPort = yield aport_1.default();
        const nodes = [];
        nodes.push(new portal_1.default({ port: portalPort, kadOption: { kBucketSize } }));
        for (let i = 0; i < num; i++) {
            const node = new _1.default({
                target: { url: "localhost", port: portalPort },
                kadOption: { kBucketSize }
            });
            yield node.onConnect.asPromise();
            nodes.push(node);
        }
        return nodes;
    });
}
describe("portal", () => {
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
        nodes[0].close();
    }), 1000 * 6000);
});
//# sourceMappingURL=test.js.map