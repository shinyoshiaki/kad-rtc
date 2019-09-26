import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
export default function findNode(searchkid: string, di: DependencyInjection): Promise<Peer | undefined>;
declare const FindNode: (searchkid: string, except: string[]) => {
    rpc: "FindNode";
    searchkid: string;
    except: string[];
};
export declare type FindNode = ReturnType<typeof FindNode>;
declare const FindNodeAnswer: (sdp: string, peerkid: string) => {
    rpc: "FindNodeAnswer";
    sdp: string;
    peerkid: string;
};
export declare type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
export {};
