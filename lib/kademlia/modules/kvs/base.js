"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_1 = tslib_1.__importDefault(require("../../../utill/event"));
class KevValueStore {
    constructor() {
        this.db = {};
        this.onSet = new event_1.default();
        this.get = (key) => this.db[key];
    }
    set(key, value) {
        this.db[key] = value;
        this.onSet.excute({ key, value });
    }
}
exports.default = KevValueStore;
//# sourceMappingURL=base.js.map