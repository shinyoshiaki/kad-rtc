"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor() {
        this.asPromise = (timelimit) => new Promise((resolve, reject) => {
            const timeout = timelimit &&
                setTimeout(() => {
                    reject("Event asPromise timeout");
                }, timelimit);
            this.once(data => {
                if (timeout)
                    clearTimeout(timeout);
                resolve(data);
            });
        });
        this.event = {
            stack: [],
            index: 0
        };
    }
    execute(data) {
        for (let item of this.event.stack) {
            if (data)
                item.func(data);
            else
                item.func(undefined);
        }
    }
    subscribe(func) {
        const id = this.event.index;
        this.event.stack.push({ func, id });
        this.event.index++;
        const unSubscribe = () => {
            this.event.stack = this.event.stack.filter(item => item.id !== id && item);
        };
        return { unSubscribe };
    }
    once(func) {
        const off = this.subscribe(data => {
            off.unSubscribe();
            func(data);
        });
    }
}
exports.default = Event;
//# sourceMappingURL=event.js.map