import Event from "rx.mini";
import { mimeType, interval, torrent2hash, abs2torrent } from "./const";
import { readAsArrayBuffer } from "../media/media";
import { Kademlia } from "../..";

export default class SuperStreamVideo {
  onChunks = new Event<ArrayBuffer[]>();

  private async recordInterval(stream: MediaStream) {
    let chunks: ArrayBuffer[] = [];

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 128_000
    });

    mediaRecorder.ondataavailable = async ({ data: blob }) => {
      const buf: undefined | ArrayBuffer = (await readAsArrayBuffer(
        blob
      )) as any;
      if (buf) {
        chunks.push(buf);

        if (chunks.length === 10) {
          this.onChunks.execute(chunks);
          chunks = [];
        }
      }
    };

    mediaRecorder.start(interval);

    setTimeout(() => {
      mediaRecorder.stop();
    }, 60 * 1000 * 10);
  }

  async streamViaKad(
    stream: MediaStream,
    onHeader: (s: string) => void,
    kad: Kademlia
  ) {
    this.recordInterval(stream);

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
