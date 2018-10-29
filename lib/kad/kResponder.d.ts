import Kademlia from "./kademlia";
export default class KResponder {
    offerQueue: Array<any>;
    storeChunks: {
        [key: string]: any[];
    };
    constructor(kad: Kademlia);
    playOfferQueue(): Promise<void>;
    response(rpc: string, req: any): void;
}
