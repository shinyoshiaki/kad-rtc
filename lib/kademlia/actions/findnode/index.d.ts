import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
import { Signal } from "webrtc4me";
export default function findNode(searchKid: string, di: DependencyInjection): Promise<Peer[]>;
declare const FindNode: (searchKid: string, except: string[]) => {
    type: "FindNode";
    searchKid: string;
    except: string[];
};
export declare type FindNode = ReturnType<typeof FindNode>;
declare const FindNodeAnswer: (sdp: Signal, peerKid: string) => {
    type: "FindNodeAnswer";
    sdp: Signal;
    peerKid: string;
};
export declare type FindNodeAnswer = ReturnType<typeof FindNodeAnswer>;
export {};
