"use strict";
import WebRTC from "simple-datachannel";
import http from "http";
import socketio from "socket.io";
import client from "socket.io-client";
import Kademlia from "../kad/Kademlia";
import sha1 from "sha1";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER"
};

let peerOffer, peerAnswer;
export default class PortalNode {
  constructor(myPort, target = { address: undefined, port: undefined }) {
    this.myPort = myPort;
    this.targetUrl = undefined;
    if (target.address != undefined && target.address.length > 1) {
      this.targetUrl = "http://" + target.address + ":" + target.port;
      console.log("target url", this.targetUrl);
    }
    this.nodeId = sha1(Math.random().toString());
    console.log("nodeId", this.nodeId);
    this.kad = new Kademlia(this.nodeId);

    this.srv = http.Server();
    this.io = socketio(this.srv, { origins: "*:*" });
    this.srv.listen(this.myPort);

    this.io.on("connection", socket => {
      socket.on(def.OFFER, data => {
        this.answerFirst(data, socket.id);
      });
    });

    if (this.targetUrl != undefined) {
      const socket = client.connect(this.targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });

      socket.on(def.ANSWER, data => {
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
      });
    }
  }

  offerFirst(socket) {
    console.log("@cli", "offer first");
    peerOffer = new WebRTC();
    peerOffer.makeOffer();

    peerOffer.ev.once("signal", sdp => {
      socket.emit(def.OFFER, {
        type: def.OFFER,
        nodeId: this.nodeId,
        sdp: sdp
      });
    });

    peerOffer.ev.once("connect", () => {
      peerOffer.connected();
      setTimeout(() => {
        this.kad.addknode(peerOffer);
      }, 1 * 1000);
    });
  }

  answerFirst(data, socketId) {
    return new Promise(resolve => {
      peerAnswer = new WebRTC();
      peerAnswer.makeAnswer(data.sdp);

      peerAnswer.connecting(data.nodeId);

      setTimeout(() => {
        resolve(false);
      }, 3 * 1000);

      peerAnswer.ev.once("signal", sdp => {
        this.io.sockets.sockets[socketId].emit(def.ANSWER, {
          sdp: sdp,
          nodeId: this.nodeId
        });
      });

      peerAnswer.ev.once("connect", () => {
        peerAnswer.connected();
        this.kad.addknode(peerAnswer);
        resolve(true);
      });
    });
  }
}
