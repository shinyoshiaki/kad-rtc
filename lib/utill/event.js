"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event() {
        var _this = this;
        this.asPromise = function (timelimit) {
            return new Promise(function (resolve, reject) {
                var timeout = timelimit &&
                    setTimeout(function () {
                        reject();
                    }, timelimit);
                _this.once(function (data) {
                    if (timeout)
                        clearTimeout(timeout);
                    resolve(data);
                });
            });
        };
        this.event = { stack: [], index: 0 };
    }
    Event.prototype.excute = function (data) {
        for (var _i = 0, _a = this.event.stack; _i < _a.length; _i++) {
            var item = _a[_i];
            if (data)
                item.func(data);
            else
                item.func(undefined);
        }
    };
    Event.prototype.subscribe = function (func) {
        var _this = this;
        var id = this.event.index;
        this.event.stack.push({ func: func, id: id });
        this.event.index++;
        var unSubscribe = function () {
            _this.event.stack = _this.event.stack.filter(function (item) { return item.id !== id && item; });
        };
        return { unSubscribe: unSubscribe };
    };
    Event.prototype.allUnsubscribe = function () {
        this.event = { stack: [], index: 0 };
    };
    Event.prototype.once = function (func) {
        var off = this.subscribe(function (data) {
            off.unSubscribe();
            func(data);
        });
    };
    return Event;
}());
exports.default = Event;
//# sourceMappingURL=event.js.map