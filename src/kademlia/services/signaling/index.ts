import Event from "rx.mini";
import Peer from "../../modules/peer/base";

export default class Signaling {
  candidates: { [kid: string]: Event<Peer> } = {};

  constructor(private peerCreate: (kid: string) => Peer) {}

  private exist(kid: string) {
    return Object.keys(this.candidates).includes(kid);
  }

  create(kid: string) {
    if (this.exist(kid)) {
      return this.candidates[kid];
    } else {
      const event = new Event<Peer>();
      this.candidates[kid] = event;
      const peer = this.peerCreate(kid);
      peer.onConnect.once(() => {
        event.execute(peer);
        delete this.candidates[kid];
      });
      return peer;
    }
  }
}
