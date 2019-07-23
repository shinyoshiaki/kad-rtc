import Event from "rx.mini";
import { Kademlia } from "../..";
export default class SuperStreamVideo {
    onChunks: Event<ArrayBuffer[]>;
    private recordInterval;
    streamViaKad(stream: MediaStream, onHeader: (s: string) => void, kad: Kademlia): Promise<void>;
}
