export declare const interval = 500;
export declare const mimeType = "video/webm; codecs=\"opus,vp9\"";
export declare const abs2torrent: (abs: ArrayBuffer[]) => {
    i: number;
    v: string;
}[];
export declare type Torrent = ReturnType<typeof abs2torrent>;
export declare const torrent2hash: (torrent: {
    i: number;
    v: string;
}[]) => string;
