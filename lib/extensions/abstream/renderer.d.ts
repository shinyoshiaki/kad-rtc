import Event from "rx.mini";
import { Kademlia } from "../..";
export default class RenderArraybuffer {
    private kad;
    private torrents;
    observer: Event<Uint8Array>;
    buffer: {
        subscribe: (execute: (data: Uint8Array) => void, complete?: (() => void) | undefined, error?: ((e: any) => void) | undefined) => {
            unSubscribe: () => void;
        };
        asPromise: (timelimit?: number | undefined) => Promise<Uint8Array>;
        once: (execute: (data: Uint8Array) => void, complete?: (() => void) | undefined, error?: ((e: any) => void) | undefined) => void;
    };
    constructor(kad: Kademlia);
    getVideo: (headerKey: string) => void;
    private getChunks;
}
