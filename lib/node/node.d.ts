import Kademlia from "../kad/kademlia";
export default class Node {
    targetUrl: string | undefined;
    kad: Kademlia;
    constructor(targetAddress: string, targetPort: string, opt?: {
        pubkey?: string;
        seckey?: string;
    });
    offerFirst(socket: any): void;
}
