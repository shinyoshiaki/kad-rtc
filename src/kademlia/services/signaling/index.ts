import Event from "rx.mini";
import { Peer } from "../../modules/peer/base";

type Candidate = { peer: Peer; finish: () => void };

export default class Signaling {
  private candidates: { [kid: string]: Event<Candidate> } = {};

  constructor(private peerCreate: (kid: string) => Peer) {}

  private exist(kid: string) {
    return Object.keys(this.candidates).includes(kid);
  }

  delete(kid: string) {
    delete this.candidates[kid];
  }

  create(kid: string) {
    if (this.exist(kid)) {
      return { candidate: this.candidates[kid] };
    } else {
      const event = new Event<Candidate>();
      this.candidates[kid] = event;

      const peer = this.peerCreate(kid);

      peer.onConnect.once(finish => {
        event.execute({ peer, finish });
        this.delete(kid);
      });

      return { peer };
    }
  }
}
