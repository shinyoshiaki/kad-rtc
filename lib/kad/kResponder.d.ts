import Kademlia from "./kademlia";
export default class KResponder {
    constructor(kad: Kademlia);
    response(rpc: string, req: any): void;
}
