import { DependencyInjection } from "../../di";
import Peer from "../../modules/peer/base";
declare const FindNode: (searchkid: string, except: string[]) => {
    rpc: "FindNode";
    searchkid: string;
    except: string[];
};
export declare type FindNode = ReturnType<typeof FindNode>;
declare const FindNodeAnswer: (sdp: any, peerkid: string) => {
    rpc: "FindNodeAnswer";
    sdp: any;
    peerkid: string;
};
export declare type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
export default function findNode(searchkid: string, di: DependencyInjection): Promise<Peer | undefined>;
export {};
