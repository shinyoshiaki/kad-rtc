import { abs2torrent, interval, mimeType, torrent2hash } from "./const";

import Event from "rx.mini";
import { Kademlia } from "../..";
import { readAsArrayBuffer } from "../media/media";

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

      const value = JSON.stringify(torrent);
      const msg = torrent2hash(abs2torrent(abs));

      kad.store(value, msg);
      torrent.map(item => {
        const ab = buffer[item.i];
        kad.store(Buffer.from(ab));
      });

      buffer = abs;
    });
  }
}
