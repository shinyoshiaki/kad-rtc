"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _1 = tslib_1.__importDefault(require("."));
describe("portal", () => {
    test("p2p", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const a = new _1.default({ port: 10000 });
        const b = new _1.default({
            port: 10001,
            target: { port: 10000, url: "localhost" }
        });
        yield b.onConnect.asPromise();
        expect(a.kademlia.di.kTable.getPeer(b.kid)).not.toBe(undefined);
    }), 1000 * 6000);
    // test(
    //   "findnode",
    //   async () => {
    //     const nodes: Portal[] = [];
    //     const first = new Portal({ port: 20000 });
    //     nodes.push(first);
    //     for (let i = 1; i < 6; i++) {
    //       const node = new Portal({
    //         target: { url: "localhost", port: 20000 + i - 1 },
    //         port: 20000 + i
    //       });
    //       await node.onConnect.asPromise();
    //       nodes.push(node);
    //     }
    //     const last = nodes.slice(-1)[0];
    //     await new Promise(r => setTimeout(r, 5000));
    //     expect(true).toBe(true);
    //   },
    //   1000 * 6000
    // );
});
//# sourceMappingURL=test.js.map