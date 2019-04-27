import http from "http";
import socketio from "socket.io";
import sha1 from "sha1";
import client from "socket.io-client";
import Kademlia from "../../kademlia";
import Peer, { PeerModule } from "../../kademlia/modules/peer/webrtc";
import Event from "../../utill/event";

type Option = {
  port: number;
  target?: { url: string; port: number };
};

const Request = (clientKid: string) => {
  return { rpc: "Request" as const, clientKid };
};

type Request = ReturnType<typeof Request>;

const Offer = (sdp: string, serverKid: string) => {
  return { rpc: "Offer" as const, sdp, serverKid };
};

type Offer = ReturnType<typeof Offer>;

const Answer = (sdp: string, clientKid: string) => {
  return { rpc: "Answer" as const, sdp, clientKid };
};

type Answer = ReturnType<typeof Answer>;

type actions = Offer | Request | Answer;

// server offer

export default class Portal {
  kid = sha1(Math.random().toString()).toString();
  kademlia = new Kademlia(this.kid, PeerModule);
  peers: { [key: string]: Peer } = {};
  onConnect = new Event();

  constructor(private opt: Option) {
    const { target, port } = opt;
    if (target) {
      const socket = client.connect("http://" + target.url + ":" + target.port);
      socket.on("connect", () => {
        socket.emit("rpc", Request(this.kid));
      });
      socket.on("rpc", (data: actions) => {
        if (data.rpc === "Offer") {
          this.peers[data.serverKid] = PeerModule(data.serverKid);
          this.answer(socket, data);
        }
      });
    }

    const srv = new http.Server();
    const io = socketio(srv);
    srv.listen(port);
    io.on("connection", socket => {
      socket.on("rpc", (data: actions) => {
        if (data.rpc === "Request") {
          this.peers[data.clientKid] = PeerModule(data.clientKid);
          this.offer(io.sockets.sockets[socket.id], data);
        }
        if (data.rpc === "Answer") {
          const peer = this.peers[data.clientKid];
          peer.setAnswer(data.sdp);
        }
      });
    });
  }

  async offer(socket: SocketIO.Socket, data: Request) {
    const peer = this.peers[data.clientKid];

    const sdp = await peer.createOffer();
    socket.emit("rpc", Offer(sdp, this.kademlia.kid));
    await peer.onConnect.asPromise();

    await this.kademlia.add(peer);
    this.onConnect.excute();
  }

  async answer(socket: SocketIOClient.Socket, data: Offer) {
    const peer = this.peers[data.serverKid];

    const sdp = await peer.setOffer(data.sdp);
    socket.emit("rpc", Answer(sdp, this.kademlia.kid));
    await peer.onConnect.asPromise();

    await this.kademlia.add(peer);
    this.onConnect.excute();
  }
}
