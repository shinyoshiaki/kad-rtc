"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testa_1 = require("../findnode/testa");
const _1 = tslib_1.__importDefault(require("."));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const kBucketSize = 8;
const num = 5;
describe("store", () => {
    test("store", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = yield testa_1.testSetupNodes(kBucketSize, num);
        const testStore = (value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const node = nodes[0];
            yield _1.default(value, node);
        });
        yield testStore("test");
        expect(Object.keys(nodes.slice(-1)[0].kvs.db).includes(sha1_1.default("test").toString())).toBe(true);
    }), 1000 * 6000);
});
//# sourceMappingURL=testa.js.map