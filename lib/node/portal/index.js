"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http_1 = tslib_1.__importDefault(require("http"));
const socket_io_1 = tslib_1.__importDefault(require("socket.io"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const socket_io_client_1 = tslib_1.__importDefault(require("socket.io-client"));
const kademlia_1 = tslib_1.__importDefault(require("../../kademlia"));
const webrtc_1 = require("../../kademlia/modules/peer/webrtc");
const rx_mini_1 = tslib_1.__importDefault(require("rx.mini"));
const base_1 = require("../../kademlia/modules/kvs/base");
const Request = (clientKid) => {
    return { rpc: "Request", clientKid };
};
const Offer = (sdp, serverKid) => {
    return { rpc: "Offer", sdp, serverKid };
};
const Answer = (sdp, clientKid) => {
    return { rpc: "Answer", sdp, clientKid };
};
// server offer
class PortalNode {
    constructor(opt) {
        this.opt = opt;
        this.kid = sha1_1.default(Math.random().toString()).toString();
        this.kademlia = new kademlia_1.default(this.kid, { peerCreate: webrtc_1.PeerModule, kvs: base_1.KvsModule() }, this.opt.kadOption);
        this.peers = {};
        this.onConnect = new rx_mini_1.default();
        try {
            const { target, port } = opt;
            if (target) {
                const socket = socket_io_client_1.default.connect("http://" + target.url + ":" + target.port);
                socket.on("connect", () => {
                    socket.emit("rpc", Request(this.kid));
                });
                socket.on("rpc", (data) => {
                    if (data.rpc === "Offer") {
                        this.peers[data.serverKid] = webrtc_1.PeerModule(data.serverKid);
                        this.answer(socket, data);
                    }
                });
            }
            const srv = new http_1.default.Server();
            const io = (this.io = socket_io_1.default(srv));
            srv.listen(port);
            io.on("connection", socket => {
                try {
                    socket.on("rpc", (data) => {
                        if (data.rpc === "Request") {
                            this.peers[data.clientKid] = webrtc_1.PeerModule(data.clientKid);
                            this.offer(io.sockets.sockets[socket.id], data);
                        }
                        if (data.rpc === "Answer") {
                            const peer = this.peers[data.clientKid];
                            peer.setAnswer(data.sdp);
                        }
                    });
                }
                catch (error) {
                    console.error(error);
                }
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    offer(socket, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const peer = this.peers[data.clientKid];
            const sdp = yield peer.createOffer();
            socket.emit("rpc", Offer(sdp, this.kademlia.kid));
            yield peer.onConnect.asPromise();
            yield this.kademlia.add(peer);
            this.onConnect.excute();
        });
    }
    answer(socket, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const peer = this.peers[data.serverKid];
            const sdp = yield peer.setOffer(data.sdp);
            socket.emit("rpc", Answer(sdp, this.kademlia.kid));
            yield peer.onConnect.asPromise();
            yield this.kademlia.add(peer);
            this.onConnect.excute();
        });
    }
    close() {
        if (this.io)
            this.io.close();
    }
}
exports.default = PortalNode;
//# sourceMappingURL=index.js.map