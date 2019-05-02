"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const test_1 = require("../findnode/test");
const store_1 = tslib_1.__importDefault(require("../store"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const _1 = tslib_1.__importDefault(require("."));
const kBucketSize = 5;
const num = kBucketSize * 2;
const getRandomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
describe("findvalue", () => {
    test("findvalue", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nodes = yield test_1.testSetupNodes(kBucketSize, num);
        const testStore = (value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const node = nodes[0];
            yield store_1.default(value, node);
        });
        yield testStore("test");
        const testFindValue = (value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const key = sha1_1.default(value).toString();
            const node = nodes[getRandomInt(0, nodes.length - 1)];
            const res = yield _1.default(key, node);
            expect(res).toBe(value);
        });
        for (let _ in [...Array(kBucketSize)]) {
            yield testFindValue("test");
        }
        yield new Promise(r => setTimeout(r, 0));
    }), 1000 * 6000);
});
//# sourceMappingURL=test.js.map