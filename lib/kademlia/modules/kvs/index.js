"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KevValueStore {
    constructor() {
        this.db = {};
        this.get = (key) => this.db[key];
    }
    set(key, value) {
        this.db[key] = value;
    }
}
exports.default = KevValueStore;
//# sourceMappingURL=index.js.map