import WebRTC from "webrtc4me";
import client from "socket.io-client";
import Kademlia from "../kad/kademlia";

enum def {
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  ONCOMMAND = "ONCOMMAND"
}

export default class Node {
  targetUrl: string | undefined;
  kad: Kademlia;
  peerOffer: WebRTC | undefined;

  constructor(
    target: { address: string; port: string },
    opt?: { pubkey?: string; seckey?: string }
  ) {
    if (target.address) {
      this.targetUrl = "http://" + target.address + ":" + target.port;
      const socket = client.connect(this.targetUrl);
      socket.on("connect", () => {
        this.offerFirst(socket);
      });
      socket.on(def.ANSWER, (data: any) => {
        if (this.peerOffer) this.peerOffer.setAnswer(data.sdp, data.nodeId);
      });
    }

    if (opt) {
      this.kad = new Kademlia({ pubkey: opt.pubkey, secKey: opt.seckey });
    } else {
      this.kad = new Kademlia();
    }
  }

  offerFirst(socket: any) {
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
      this.kad.connect(peer);
    };
    this.peerOffer = peer;
  }
}
