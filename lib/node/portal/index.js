"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http_1 = tslib_1.__importDefault(require("http"));
const socket_io_1 = tslib_1.__importDefault(require("socket.io"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const socket_io_client_1 = tslib_1.__importDefault(require("socket.io-client"));
const kademlia_1 = tslib_1.__importDefault(require("../../kademlia"));
const webrtc_1 = require("../../kademlia/modules/peer/webrtc");
const event_1 = tslib_1.__importDefault(require("../../utill/event"));
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
class Portal {
    constructor(opt) {
        this.opt = opt;
        this.kid = sha1_1.default(Math.random().toString()).toString();
        this.kademlia = new kademlia_1.default(this.kid, webrtc_1.PeerModule);
        this.peers = {};
        this.onConnect = new event_1.default();
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
        const io = socket_io_1.default(srv);
        srv.listen(port);
        io.on("connection", socket => {
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
        });
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
}
exports.default = Portal;
//# sourceMappingURL=index.js.map