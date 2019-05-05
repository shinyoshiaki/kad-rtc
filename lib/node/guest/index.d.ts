import Kademlia from "../../kademlia";
import Peer from "../../kademlia/modules/peer/base";
import Event from "rx.mini";
import { Option } from "../../kademlia/ktable";
declare type Options = {
    target: {
        url: string;
        port: number;
    };
    kadOption?: Partial<Option>;
};
export default class GuestNode {
    private opt;
    kid: string;
    kademlia: Kademlia;
    peers: {
        [key: string]: Peer;
    };
    onConnect: Event<{}>;
    constructor(opt: Options);
    private answer;
}
export {};
