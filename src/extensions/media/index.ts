import { Media, readAsArrayBuffer, waitEvent } from "./media";

import Event from "rx.mini";
import { Kademlia } from "../..";
import sha1 from "sha1";

const interval = 500;

const mimeType = `video/webm; codecs="opus,vp9"`;

export class StreamVideo extends Media {
  private async recordInterval(
    stream: MediaStream,
    eventChunk: Event<ArrayBuffer>,
    onMsReady: (ms: MediaSource) => void
  ) {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 128_000
    });
    const ms = new MediaSource();
    onMsReady(ms);

    await waitEvent(ms, "sourceopen", undefined);

    const sb = ms.addSourceBuffer(mimeType);

    mediaRecorder.ondataavailable = async ({ data: blob }) => {
      const buf: undefined | ArrayBuffer = (await readAsArrayBuffer(
        blob
      )) as any;
      if (buf) {
        this.chunks.push(buf);
        eventChunk.execute(Buffer.from(buf));
      }
    };

    mediaRecorder.start(interval);

    this.update(sb);

    setTimeout(() => {
      mediaRecorder.stop();
    }, 60 * 1000 * 10);
  }

  async streamViaKad(
    stream: MediaStream,
    onHeader: (s: string) => void,
    onMs: (ms: MediaSource) => void,
    kad: Kademlia
  ) {
    const record = new Event<ArrayBuffer>();

    this.recordInterval(stream, record as any, ms => {
      onMs(ms);
    });

    let buffer: ArrayBuffer = await record.asPromise();

    const hash = (ab: ArrayBuffer) => sha1(Buffer.from(ab)).toString();

    const key = hash(buffer);
    onHeader(key);

    const chunks: ArrayBuffer[] = [];
    record.subscribe(async ab => {
      chunks.push(ab);
    });

    while (true) {
      const ab = chunks.shift();
      if (ab) {
        if (ab.byteLength > 16000) {
          console.warn("to large", ab.byteLength);
        }
        const data = buffer;
        const msg = hash(ab);
        kad.store(data, msg);
        buffer = ab;
      } else {
        await new Promise(r => setTimeout(r, 0));
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

    const work = async () => {
      try {
        for (
          let { item } = first, buf = headerKey, start = false, retry = 0;
          retry < 20;

        ) {
          if (this.chunks.length > (1000 / interval) * 10) {
            if (!start) {
              start = true;
              this.update(sb);
            }
          }

          if (!item.msg) {
            console.warn("file format error");
            break;
          }

          if (item.msg !== buf) {
            this.chunks.push((item.value as any).buffer);
            buf = item.msg;
          }

          const next = await kad.findValue(item.msg);
          console.log(item.msg, { next });
          if (!next) {
            console.log("fail next", { retry });
            retry++;
            await new Promise(r => setTimeout(r, 100 * retry));
            continue;
          } else {
            item = next.item;
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
