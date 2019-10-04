"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findvalue_1 = tslib_1.__importDefault(require("../kademlia/actions/findvalue"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const store_1 = tslib_1.__importDefault(require("../kademlia/actions/store"));
const testtools_1 = require("./testtools");
const kBucketSize = 8;
const num = 10;
const getRandomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
describe("findvalue", () => {
    test("findvalue", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = yield testtools_1.testSetupNodes(kBucketSize, num);
        const testStore = (value) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const node = nodes[0];
            const key = sha1_1.default(value).toString();
            yield store_1.default(node, key, value);
        });
        yield testStore("test");
        const testFindValue = (value) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const key = sha1_1.default(value).toString();
            const node = nodes[getRandomInt(0, nodes.length - 1)];
            const { item } = (yield findvalue_1.default(key, node));
            expect(item.value).toBe(value);
        });
        for (let _ in [...Array(kBucketSize)]) {
            yield testFindValue("test");
        }
        yield new Promise(r => setTimeout(r, 0));
        nodes.forEach(node => node.kTable.allPeers.forEach(peer => peer.disconnect()));
    }), 1000 * 6000);
});
//# sourceMappingURL=findvalue.test.js.map