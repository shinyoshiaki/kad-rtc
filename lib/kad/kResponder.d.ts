import Kademlia from "./kademlia";
export default class KResponder {
    offerQueue: Array<any>;
    constructor(kad: Kademlia);
    playOfferQueue(): Promise<void>;
    response(rpc: string, req: any): void;
}
