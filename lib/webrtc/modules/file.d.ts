import WebRTC from "../core";
import { Subject, Observable } from "rxjs";
export declare function getSliceArrayBuffer(blob: Blob): Observable<any>;
interface Action {
    type: string;
    payload: any;
}
interface Downloading extends Action {
    type: "downloading";
    payload: {
        now: number;
        size: number;
    };
}
interface Downloaded extends Action {
    type: "downloaded";
    payload: {
        chunks: ArrayBuffer[];
        name: string;
    };
}
declare type Actions = Downloading | Downloaded;
export default class FileShare {
    private peer;
    label?: string | undefined;
    subject: Subject<Actions>;
    state: Observable<Actions>;
    private chunks;
    name: string;
    private size;
    constructor(peer: WebRTC, label?: string | undefined);
    sendStart(name: string, size: number): void;
    sendChunk(chunk: ArrayBuffer): void;
    sendEnd(): void;
    send(blob: File): void;
}
export {};
