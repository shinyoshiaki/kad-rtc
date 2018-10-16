import WebRTC from "webrtc4me";
import client from "socket.io-client";
import sha1 from "sha1";
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
  kad: Kademlia;

  constructor(targetAddress: string, targetPort: string) {
    this.nodeId = sha1(Math.random().toString()).toString();
    if (targetAddress) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
      const socket = client.connect(this.targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        peerOffer.setAnswer(data.sdp, data.nodeId);
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
