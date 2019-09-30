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
            const { unSubscribe } = peer.onRpc.subscribe(rpc => {
                this.event.execute({ rpc: rpc, peer });
            });
            peer.onDisconnect.once(unSubscribe);
        }
    }
    listenStore(peer) {
        this.rpcManager
            .asObservable("Store", peer)
            .subscribe(rpc => this.store.execute({ rpc: rpc, peer }));
    }
    listenFindnode(peer) {
        this.rpcManager
            .asObservable("FindNode", peer)
            .subscribe(rpc => this.findnode.execute({ rpc: rpc, peer }));
    }
    listenFindvalue(peer) {
        this.rpcManager
            .asObservable("FindValue", peer)
            .subscribe(rpc => this.findvalue.execute({ rpc: rpc, peer }));
    }
    selectListen(rpcCode) {
        const event = new rx_mini_1.default();
        this.event.subscribe(({ rpc, peer }) => {
            if (rpcCode === rpc.type) {
                event.execute({ rpc: rpc, peer });
            }
        });
        return event;
    }
}
exports.default = EventManager;
//# sourceMappingURL=index.js.map