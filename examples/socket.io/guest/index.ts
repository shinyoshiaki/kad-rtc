import client from "socket.io-client";
import Event from "rx.mini";
import { Kademlia, PeerModule, KvsModule, Peer, genKid } from "../../../src";

type Options = {
  target: { url: string; port: number };
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

type actions = Offer;

export default class GuestNode {
  kademlia = new Kademlia(genKid(), { peerCreate: PeerModule, kvs: KvsModule });
  peers: { [key: string]: Peer } = {};
  onConnect = new Event();

  constructor(private opt: Options) {
    try {
      this.asGuest();
    } catch (error) {
      console.error(error);
    }
  }
  private asGuest() {
    const { target } = this.opt;
    if (target) {
      const socket = client.connect("http://" + target.url + ":" + target.port);
      socket.on("connect", () => {
        socket.emit("rpc", Request(this.kademlia.kid));
      });
      socket.on("rpc", (data: actions) => {
        if (data.rpc === "Offer") {
          this.peers[data.serverKid] = PeerModule(data.serverKid);
          this.answer(socket, data);
        }
      });
    }
  }

  private async answer(socket: SocketIOClient.Socket, data: Offer) {
    const peer = this.peers[data.serverKid];

    const sdp = await peer.setOffer(data.sdp);
    socket.emit("rpc", Answer(sdp, this.kademlia.kid));
    await peer.onConnect.asPromise();

    await this.kademlia.add(peer);
    this.onConnect.excute();
  }
}
