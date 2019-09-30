import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
import { Peer } from "../../modules/peer/base";
export default function findValue(key: string, di: DependencyInjection): Promise<{
    item: Item;
    peer: Peer;
} | undefined>;
declare const FindValue: (key: string, except: string[]) => {
    type: "FindValue";
    key: string;
    except: string[];
};
export declare type FindValue = ReturnType<typeof FindValue>;
declare const FindValueAnswer: (sdp: string, peerkid: string) => {
    type: "FindValueAnswer";
    sdp: string;
    peerkid: string;
};
export declare type FindValueAnswer = ReturnType<typeof FindValueAnswer>;
export {};
