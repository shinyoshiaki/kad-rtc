import WebRTC from "webrtc4me";
import client from "socket.io-client";
import Kademlia from "../kad/kademlia";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer: WebRTC;

export default class Node {
  targetUrl: string | undefined;
  kad: Kademlia;

  constructor(
    targetAddress: string,
    targetPort: string,
    opt?: { pubkey?: string; seckey?: string }
  ) {
    if (targetAddress) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
      const socket = client.connect(this.targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        peerOffer.setAnswer(data.sdp, data.nodeId);
      });
    }

    if (opt)
      this.kad = new Kademlia({ pubkey: opt.pubkey, secKey: opt.seckey });
    else this.kad = new Kademlia();
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
      console.log("first connected");
      this.kad.connect(peer);
    };

    peerOffer = peer;
  }
}
