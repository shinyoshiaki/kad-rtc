"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class KevValueStore {
    constructor() {
        this.db = {};
        this.onSet = new rx_mini_1.default();
        this.get = (key) => this.db[key];
    }
    set(key, value, msg) {
        this.db[key] = { value, msg };
        this.onSet.execute({ key, value });
    }
}
exports.default = KevValueStore;
exports.KvsModule = (() => new KevValueStore())();
//# sourceMappingURL=base.js.map