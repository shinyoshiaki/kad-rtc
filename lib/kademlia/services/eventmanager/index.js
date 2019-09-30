"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class EventManager {
    constructor(rpcManager) {
        this.rpcManager = rpcManager;
        this.store = new rx_mini_1.default();
        this.findnode = new rx_mini_1.default();
        this.findvalue = new rx_mini_1.default();
    }
    listen(peer) {
        this.listenStore(peer);
        this.listenFindnode(peer);
        this.listenFindvalue(peer);
    }
    listenStore(peer) {
        this.rpcManager
            .asObservable("Store", peer)
            .subscribe(this.store.execute);
    }
    listenFindnode(peer) {
        this.rpcManager
            .asObservable("FindNode", peer)
            .subscribe(this.findnode.execute);
    }
    listenFindvalue(peer) {
        this.rpcManager
            .asObservable("FindValue", peer)
            .subscribe(this.findvalue.execute);
    }
}
exports.default = EventManager;
//# sourceMappingURL=index.js.map