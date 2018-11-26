import WebRTC from "webrtc4me";
import http from "http";
import socketio from "socket.io";
import client from "socket.io-client";
import events from "events";
import Kademlia from "../kad/kademlia";

enum def {
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  ONCOMMAND = "ONCOMMAND"
}

export default class PortalNode {
  ev: events.EventEmitter;
  io: any;
  kad: Kademlia;
  peerOffer: WebRTC | undefined;

  constructor(myPort: number, target?: { address: string; port: string }) {
    if (target) {
      const targetUrl = "http://" + target.address + ":" + target.port;
      const socket = client.connect(targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        if (this.peerOffer) this.peerOffer.setAnswer(data.sdp, data.nodeId);
      });
    }

    const srv = new http.Server();
    this.io = socketio(srv);
    srv.listen(myPort);

    this.io.on("connection", (socket: any) => {
      socket.on(def.OFFER, (data: any) => {
        this.answerFirst(data, socket.id);
      });
    });
    this.ev = new events.EventEmitter();
    this.kad = new Kademlia({ kLength: 20 });
  }

  offerFirst(socket: any) {
    console.log("@cli", "offer first");
    const peer = new WebRTC();
    peer.makeOffer();

    peer.signal = sdp => {
      socket.emit(def.OFFER, {
        type: def.OFFER,
        nodeId: this.kad.nodeId,
        sdp: sdp
      });
    };

    peer.connect = () => {
      console.log("first offer connected", peer.nodeId);
      this.kad.connect(peer);
    };
    this.peerOffer = peer;
  }

  answerFirst(data: any, socketId: string) {
    return new Promise((resolve, reject) => {
      const peer = new WebRTC();
      console.log("answer first", data);
      peer.makeAnswer(data.sdp, data.nodeId);

      const timeout = setTimeout(() => {
        reject("timeout");
      }, 3 * 1000);

      peer.signal = sdp => {
        this.io.sockets.sockets[socketId].emit(def.ANSWER, {
          sdp: sdp,
          nodeId: this.kad.nodeId
        });
      };

      peer.connect = () => {
        peer.nodeId = data.nodeId; //謎のバグ
        console.log("first answer connected", peer.nodeId);
        clearTimeout(timeout);
        resolve(true);
        this.kad.connect(peer);
      };
    });
  }
}
