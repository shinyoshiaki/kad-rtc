"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class Worker {
    constructor(jobs) {
        this.jobs = jobs;
        this.running = false;
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.shift();
            if (job) {
                this.running = true;
                const { func, args, event } = job;
                const res = yield func(...args);
                event.execute(res);
                this.execute();
            }
            else {
                this.running = false;
            }
        });
    }
    wakeup() {
        if (!this.running) {
            this.execute();
        }
    }
}
class JobSystem {
    constructor(opt = { a: 5 }) {
        this.opt = opt;
        this.jobs = [];
        this.workers = [];
        const { a } = opt;
        this.workers = [...Array(a)].map(() => new Worker(this.jobs));
    }
    add(func, args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { a } = this.opt;
            const event = new rx_mini_1.default();
            this.jobs.push({ func, args, event });
            if (this.jobs.length < a) {
                this.workers.forEach(worker => worker.wakeup());
            }
            return event.asPromise();
        });
    }
}
exports.default = JobSystem;
//# sourceMappingURL=index.js.map