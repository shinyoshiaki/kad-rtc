"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Uuid {
    constructor(prefix = Math.random().toString()) {
        this.prefix = prefix;
        this.i = 0;
    }
    setPrefix(s) {
        this.prefix = s;
    }
    get() {
        return this.prefix + this.i++;
    }
}
exports.default = Uuid;
//# sourceMappingURL=uuid.js.map