import WebRTC from "simple-datachannel/lib/NodeRTC";
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

export default class Node {
  targetUrl: string | null;
  nodeId: string;
  ev: events.EventEmitter;
  kad: Kademlia;

  constructor(targetAddress: string, targetPort: string) {
    this.nodeId = sha1(Math.random().toString()).toString();
    this.ev = new events.EventEmitter();
    if (targetAddress != null) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
      const socket = client.connect(this.targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
      });
    } else {
      this.targetUrl = null;
    }
    this.kad = new Kademlia(this.nodeId);
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
      console.log("first connected");
      this.kad.addknode(peer);
    };

    peerOffer = peer;
  }
}
