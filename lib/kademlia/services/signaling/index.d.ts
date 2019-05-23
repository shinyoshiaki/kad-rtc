import Event from "rx.mini";
import Peer from "../../modules/peer/base";
export default class Signaling {
    private peerCreate;
    private candidates;
    constructor(peerCreate: (kid: string) => Peer);
    private exist;
    delete(kid: string): void;
    create(kid: string): {
        candidate: Event<Peer>;
        peer?: undefined;
    } | {
        peer: Peer;
        candidate?: undefined;
    };
}
