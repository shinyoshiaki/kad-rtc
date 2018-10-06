import WebRTC from "simple-datachannel";
import sha1 from "sha1";
import Kademlia from "./Kademlia";
const peerOffer = new WebRTC();
const peerAnswer = new WebRTC();

const kadOffer = new Kademlia(sha1(Math.random().toString()));
const kadAnswer = new Kademlia(sha1(Math.random().toString()));

peerOffer.makeOffer({ disable_stun: true });
peerOffer.ev.on("signal", sdp => {
  console.log("offer signal");
  peerAnswer.makeAnswer(sdp, { disable_stun: true });
  peerAnswer.ev.on("signal", sdp => {
    peerOffer.setAnswer(sdp);
  });
});
peerOffer.ev.once("connect", () => {
  console.log("offer connected");
  kadOffer.addknode(peerOffer);
});
peerAnswer.ev.once("connect", () => {
  console.log("answer connected");
  kadAnswer.addknode(peerAnswer);
});
