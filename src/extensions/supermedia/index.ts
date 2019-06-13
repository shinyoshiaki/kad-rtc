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

export class StreamVideo {
  onChunks = new Event<ArrayBuffer[]>();

  private async recordInterval(stream: MediaStream) {
    let chunks: ArrayBuffer[] = [];

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2561_000
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
        const data = jsonHash(torrent);
        const msg = torrent2hash(abs2torrent(abs));

        await kad.store(key, data, msg);
        await Promise.all(
          torrent.map(async item => {
            await kad.store(item.v, buffer[item.i]);
          })
        );

        buffer = abs;
      } else {
        await new Promise(r => setTimeout(r));
      }
    }
  }
}

export class ReceiveVideo extends Media {
  async getVideo(
    headerKey: string,
    onMsReady: (ms: MediaSource) => void,
    kad: Kademlia
  ) {
    const ms = new MediaSource();
    onMsReady(ms);

    await waitEvent(ms, "sourceopen", undefined);
    const sb = ms.addSourceBuffer(mimeType);

    const first = await kad.findValue(headerKey);
    if (!first) return;

    this.update(sb);

    const work = async () => {
      try {
        for (let item = first, bufMsg = headerKey, retry = 0; retry < 20; ) {
          if (!item.msg) {
            console.warn("file format error");
            break;
          }

          if (item.msg !== bufMsg) {
            const torrent: Torrent = JSON.parse(item.value as string);
            const chunks = (await Promise.all(
              torrent.map(async item => {
                const { i, v } = item;
                let chunk = await kad.findValue(v);
                if (!chunk) chunk = await kad.findValue(v);
                if (!chunk) {
                  console.warn("broken");
                }
                return { i, chunk };
              })
            )).sort((a, b) => a.i - b.i);
            console.log({ chunks });

            for (let item of chunks) {
              this.chunks.push((item.chunk as any).buffer);
            }

            bufMsg = item.msg;
          }

          const next = await kad.findValue(item.msg);
          console.log(item.msg, { next });
          if (!next) {
            console.log("fail next", { retry });
            retry++;
            await new Promise(r => setTimeout(r, 100 * retry));
            continue;
          } else {
            item = next;
            if (retry > 0) retry--;
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (first) {
      await work().catch(console.error);
    }
  }
}
