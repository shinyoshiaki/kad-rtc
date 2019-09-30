"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
class EventManager {
    constructor(rpcManager) {
        this.rpcManager = rpcManager;
        this.event = new rx_mini_1.default();
        this.store = new rx_mini_1.default();
        this.findnode = new rx_mini_1.default();
        this.findvalue = new rx_mini_1.default();
    }
    listen(peer) {
        this.listenStore(peer);
        this.listenFindnode(peer);
        this.listenFindvalue(peer);
        {
            const { unSubscribe } = peer.onRpc.subscribe(this.event.execute);
            peer.onDisconnect.once(unSubscribe);
        }
    }
    listenStore(peer) {
        this.rpcManager
            .asObservable("Store", peer)
            .subscribe(res => this.store.execute({ res, peer }));
    }
    listenFindnode(peer) {
        this.rpcManager
            .asObservable("FindNode", peer)
            .subscribe(res => this.findnode.execute({ res, peer }));
    }
    listenFindvalue(peer) {
        this.rpcManager
            .asObservable("FindValue", peer)
            .subscribe(res => this.findvalue.execute({ res, peer }));
    }
    selectListen(rpcCode) {
        const event = new rx_mini_1.default();
        this.event.subscribe(data => {
            const { rpc } = data;
            if (rpcCode === rpc) {
                event.execute(data);
            }
        });
        return event;
    }
}
exports.default = EventManager;
//# sourceMappingURL=index.js.map