import { Kademlia } from "../..";
import { Media } from "../media/media";
import { Torrent } from "./const";
export default class SuperReceiveVideo extends Media {
    private kad;
    torrents: Torrent[];
    sb?: SourceBuffer;
    constructor(kad: Kademlia);
    getVideo(headerKey: string, onMsReady: (ms: MediaSource) => void): Promise<void>;
    private getChunks;
}
