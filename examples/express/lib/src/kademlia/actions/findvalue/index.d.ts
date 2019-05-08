import { DependencyInjection } from "../../di";
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
export default function findValue(key: string, di: DependencyInjection): Promise<string | undefined>;
export {};
