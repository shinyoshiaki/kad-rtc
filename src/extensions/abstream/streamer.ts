import Event from "rx.mini";
import { torrent2hash, abs2torrent } from "./const";
import { Kademlia } from "../..";

export default class StreamArraybuffer {
  private chunks: Uint8Array[] = [];
  private onChunks = new Event<Uint8Array[]>();

  addAb = (uint8: Uint8Array) => {
    this.chunks.push(uint8);
    if (this.chunks.length > 10) {
      this.onChunks.execute(this.chunks);
      this.chunks = [];
    }
  };

  streamViaKad = async (kad: Kademlia, onHeader: (s: string) => void) => {
    let buffer = await this.onChunks.asPromise();

    onHeader(torrent2hash(abs2torrent(buffer)));

    this.onChunks.subscribe(abs => {
      const torrent = abs2torrent(buffer);

      const key = torrent2hash(torrent);
      const value = JSON.stringify(torrent);
      const msg = torrent2hash(abs2torrent(abs));

      kad.store(key, value, msg);
      torrent.map(item => {
        const uint8 = buffer[item.i];
        kad.store(item.v, uint8);
      });

      buffer = abs;
    });
  };
}
