import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
declare const FindValue: (key: string, except: string[]) => {
    rpc: "FindValue";
    key: string;
    except: string[];
};
export declare type FindValue = ReturnType<typeof FindValue>;
declare const FindValueAnswer: (sdp: any, peerkid: string) => {
    rpc: "FindValueAnswer";
    sdp: any;
    peerkid: string;
};
export declare type FindValueAnswer = ReturnType<typeof FindValueAnswer>;
export default function findValue(key: string, di: DependencyInjection): Promise<Item | undefined>;
export {};
