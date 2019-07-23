import { Kademlia } from "../..";
export default class StreamArraybuffer {
    private chunks;
    private onChunks;
    addAb: (uint8: Uint8Array) => void;
    streamViaKad: (kad: Kademlia, onHeader: (s: string) => void) => Promise<void>;
}
