import Kademlia from "../kad/kademlia";
export default class Node {
    targetUrl: string | undefined;
    kad: Kademlia;
    constructor(targetAddress: string, targetPort: string);
    offerFirst(socket: any): void;
}
