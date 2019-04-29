"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Count {
    constructor(times, resolve) {
        this.times = times;
        this.resolve = resolve;
        this.count = 0;
        this.check = () => {
            this.count++;
            if (this.count === this.times)
                this.resolve();
        };
    }
}
exports.Count = Count;
//# sourceMappingURL=testtools.js.map