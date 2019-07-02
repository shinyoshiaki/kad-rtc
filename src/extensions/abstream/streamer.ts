import Event from "rx.mini";
import { torrent2hash, abs2torrent } from "./const";
import { Kademlia } from "../..";

export default class StreamArraybuffer {
  private chunks: ArrayBuffer[] = [];
  private onChunks = new Event<ArrayBuffer[]>();

  addAb(ab: ArrayBuffer) {
    this.chunks.push(ab);
    if (this.chunks.length > 10) {
      this.onChunks.execute(this.chunks);
      this.chunks = [];
    }
  }

  async streamViaKad(kad: Kademlia, onHeader: (s: string) => void) {
    let buffer = await this.onChunks.asPromise();

    onHeader(torrent2hash(abs2torrent(buffer)));

    this.onChunks.subscribe(abs => {
      const torrent = abs2torrent(buffer);

      const key = torrent2hash(torrent);
      const value = JSON.stringify(torrent);
      const msg = torrent2hash(abs2torrent(abs));

      kad.store(key, value, msg);
      torrent.map(item => {
        const ab = buffer[item.i];
        kad.store(item.v, Buffer.from(ab));
      });

      buffer = abs;
    });
  }
}
