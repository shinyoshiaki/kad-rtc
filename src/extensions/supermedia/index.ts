import { Kademlia } from "../..";
import { waitEvent, readAsArrayBuffer, Media } from "../media/media";
import Event from "rx.mini";
import { abHash, jsonHash } from "../../utill/crypto";

const interval = 500;

const mimeType = `video/webm; codecs="opus,vp9"`;

const abs2torrent = (abs: ArrayBuffer[]) =>
  abs.map((ab, i) => ({ i, v: abHash(ab) }));

type Torrent = ReturnType<typeof abs2torrent>;

const torrent2hash = (torrent: Torrent) => jsonHash(torrent);

export class SuperStreamVideo {
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

    const chunks: ArrayBuffer[][] = [];

    this.onChunks.subscribe(async abs => chunks.push(abs));

    while (true) {
      const abs = chunks.shift();
      if (abs) {
        const torrent = abs2torrent(buffer);

        const key = torrent2hash(torrent);
        const value = JSON.stringify(torrent);
        const msg = torrent2hash(abs2torrent(abs));

        await kad.store(key, value, msg);
        await Promise.all(
          torrent.map(async item => {
            const ab = buffer[item.i];
            await kad.store(item.v, Buffer.from(ab)); //? bug
          })
        );
        buffer = abs;
      } else {
        await new Promise(r => setTimeout(r, 10));
      }
    }
  }
}

export class SuperReceiveVideo extends Media {
  torrents: Torrent[] = [];

  constructor(private kad: Kademlia) {
    super();
  }

  async getVideo(
    headerKey: string,
    onMsReady: (ms: MediaSource) => void,
    kad: Kademlia
  ) {
    const ms = new MediaSource();
    onMsReady(ms);

    await waitEvent(ms, "sourceopen", undefined);
    this.sb = ms.addSourceBuffer(mimeType);

    const first = await kad.findValue(headerKey);
    if (!first) return;

    const work = async () => {
      for (let item = first, bufMsg = headerKey, retry = 0; retry < 20; ) {
        if (!item.msg) {
          console.warn("file format error");
          break;
        }

        if (item.msg !== bufMsg) {
          const torrent: Torrent = JSON.parse(item.value as string);
          this.torrents.push(torrent);
          bufMsg = item.msg;
        }

        const next = await kad.findValue(item.msg);
        console.log(item.msg, { next });
        if (!next) {
          console.log("fail next", { retry });
          retry++;
          if (this.torrents.length === 0)
            await new Promise(r => setTimeout(r, 100));
          else await new Promise(r => setTimeout(r, 5_000));
          continue;
        } else {
          item = next;
          if (retry > 0) retry--;
        }
      }
    };

    if (first) {
      work().catch(console.error);
      this.getChunks();
    }
  }

  private sb?: SourceBuffer;

  private async getChunks() {
    const { kad, torrents } = this;
    let start = false;
    while (true) {
      if (this.chunks.length > (1000 / interval) * 10 * 2) {
        if (!start) {
          start = true;
          this.update(this.sb!);
        }
      }

      const torrent = torrents.shift();
      if (!torrent) {
        await new Promise(r => setTimeout(r, 10));
        continue;
      }

      const chunks = (await Promise.all(
        torrent.map(async item => {
          const { i, v } = item;
          let chunk = await kad.findValue(v);
          if (!chunk) {
            for (let retry = 0; retry < 20; retry++) {
              chunk = await kad.findValue(v);
              if (chunk) {
                break;
              } else {
                console.log("fail chunk", retry);
                await new Promise(r => setTimeout(r, 100 * retry));
              }
            }
          }
          if (!chunk) {
            console.error("broken");
          }
          return { i, value: chunk!.value };
        })
      )).sort((a, b) => a.i - b.i);

      const err = chunks.some(v => !v.value);
      if (err) {
        console.warn("broken error");
        break;
      }

      for (let item of chunks) {
        this.chunks.push((item.value as any).buffer);
      }
    }
  }
}
