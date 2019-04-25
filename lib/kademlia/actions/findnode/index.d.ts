import Peer from "../../modules/peer";
import Ktable from "../../ktable";
declare const FindNode: (searchkid: string, except: string[]) => {
    rpc: "findnode";
    searchkid: string;
    except: string[];
};
export declare type FindNode = ReturnType<typeof FindNode>;
declare const FindNodeAnswer: (sdp: string, peerkid: string) => {
    rpc: "findnodeanswer";
    sdp: string;
    peerkid: string;
};
export declare type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
export default function findNode(module: (kid: string) => Peer, searchkid: string, ktable: Ktable): Promise<Peer | undefined>;
export {};
