import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
export default function findValue(key: string, di: DependencyInjection): Promise<Item | undefined>;
declare const FindValue: (key: string, except: string[]) => {
    rpc: "FindValue";
    key: string;
    except: string[];
};
export declare type FindValue = ReturnType<typeof FindValue>;
declare const FindValueAnswer: (sdp: string, peerkid: string) => {
    rpc: "FindValueAnswer";
    sdp: string;
    peerkid: string;
};
export declare type FindValueAnswer = ReturnType<typeof FindValueAnswer>;
export {};
