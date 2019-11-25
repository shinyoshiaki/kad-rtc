import { DependencyInjection } from "../../di";
import { Item } from "../../modules/kvs/base";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
export default function findValue(key: string, di: DependencyInjection, opt?: {
    preferTimeout?: number;
}): Promise<{
    item: Item;
    peer: Peer;
} | undefined>;
declare const FindValue: (key: string, except: string[]) => {
    type: "FindValue";
    key: string;
    except: string[];
};
export declare type FindValue = ReturnType<typeof FindValue>;
declare const FindValueAnswer: (sdp: Signal, peerKid: string) => {
    type: "FindValueAnswer";
    sdp: Signal;
    peerKid: string;
};
export declare type FindValueAnswer = ReturnType<typeof FindValueAnswer>;
export {};
