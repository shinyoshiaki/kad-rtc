import { Media } from "./media";
import { Kademlia } from "../..";
export declare class StreamVideo extends Media {
    private recordInterval;
    streamViaKad(stream: MediaStream, onHeader: (s: string) => void, onMs: (ms: MediaSource) => void, kad: Kademlia): Promise<void>;
}
export declare class ReceiveVideo extends Media {
    getVideo(headerKey: string, onMsReady: (ms: MediaSource) => void, kad: Kademlia): Promise<void>;
}
