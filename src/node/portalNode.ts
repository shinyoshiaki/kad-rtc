import WebRTC from "webrtc4me";
import http from "http";
import socketio from "socket.io";
import client from "socket.io-client";
import sha1 from "sha1";
import events from "events";
import Kademlia from "../kad/kademlia";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer: WebRTC;

export default class PortalNode {
  nodeId: string;
  ev: events.EventEmitter;
  io: any;
  kad: Kademlia;

  constructor(myPort: number, target?: { address: string; port: string }) {
    this.nodeId = sha1(Math.random().toString()).toString();
    console.log("nodeid", this.nodeId);
    if (target) {
      const targetUrl = "http://" + target.address + ":" + target.port;
      const socket = client.connect(targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        peerOffer.setAnswer(data.sdp, data.nodeId);
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
    this.kad = new Kademlia(this.nodeId, { kLength: 2 });
  }

  offerFirst(socket: any) {
    console.log("@cli", "offer first");
    const peer = new WebRTC();
    peer.makeOffer();

    peer.signal = sdp => {
      socket.emit(def.OFFER, {
        type: def.OFFER,
        nodeId: this.nodeId,
        sdp: sdp
      });
    };

    peer.connect = () => {
      console.log("first offer connected", peer.nodeId);
      this.kad.addknode(peer);
    };
    peerOffer = peer;
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
          nodeId: this.nodeId
        });
      };

      peer.connect = () => {
        peer.nodeId = data.nodeId; //謎のバグ
        console.log("first answer connected", peer.nodeId);
        clearTimeout(timeout);
        resolve(true);
        this.kad.addknode(peer);
      };
    });
  }
}
