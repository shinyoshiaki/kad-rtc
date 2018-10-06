import WebRTC from "simple-datachannel";
import client from "socket.io-client";
import Kademlia from "../kad/Kademlia";
import KApp from "../kad/KApp";
import sha1 from "sha1";
import events from "events";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer;
export default class Node {
  constructor(targetAddress, targetPort) {
    this.targetUrl = undefined;
    if (targetAddress !== undefined && targetAddress.length > 0) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
      console.log(this.targetUrl);
    }
    this.nodeId = sha1(Math.random().toString());
    console.log("nodeId", this.nodeId);
    this.kad = new Kademlia(this.nodeId);
    this.kApp = new KApp(this.kad);
    this.ev = new events.EventEmitter();

    this.kad.ev.on(def.ONCOMMAND, networkLayer => {
      if (JSON.stringify(networkLayer).includes("p2ch")) {
        console.log("node oncommand", networkLayer);
        this.ev.emit("p2ch", networkLayer);
      }
    });

    if (this.targetUrl !== undefined) {
      const socket = client.connect(this.targetUrl);

      socket.on("connect", () => {
        console.log("socket connected");
        this.offerFirst(socket);
      });

      socket.on(def.ANSWER, data => {
        console.log("answer id", data.nodeId);
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
      console.log("first connected");
      this.kad.addknode(peerOffer);
    });
  }

  broadCast(data) {
    this.kApp.broadcast(data);
  }

  send(target, data) {
    this.kad.send(target, data);
  }
}
