export declare class Media {
    chunks: ArrayBuffer[];
    stop: boolean;
    update(sb: SourceBuffer): Promise<void>;
    stopMedia(): void;
}
export declare function waitEvent(target: MediaSource | FileReader | SourceBuffer, event: string, error: any): Promise<{}>;
export declare function readAsArrayBuffer(blob: Blob): Promise<string | ArrayBuffer | null>;
