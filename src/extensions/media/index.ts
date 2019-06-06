import { Kademlia } from "../..";
import { waitEvent, readAsArrayBuffer, Media } from "./media";
import Event from "rx.mini";
import sha1 from "sha1";

const interval = 200;

export class StreamVideo extends Media {
  private async recordInterval(
    stream: MediaStream,
    eventChunk: Event<ArrayBuffer>,
    onMsReady: (ms: MediaSource) => void
  ) {
    const mimeType = `video/webm; codecs="opus,vp8"`;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType
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
        const key = hash(buffer);
        const data = buffer;
        const msg = hash(ab);
        kad.store(key, data, msg).then(res => console.log(res));
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
    const mimeType = `video/webm; codecs="opus,vp8"`;
    const sb = ms.addSourceBuffer(mimeType);

    const first = await kad.findValue(headerKey);
    console.log({ first });
    if (!first) return;

    let start = false;
    const work = () =>
      new Promise<boolean>(async (resolve, reject) => {
        try {
          for (let item = first; ; ) {
            if (this.chunks.length > 10) {
              if (!start) {
                start = true;
                console.log("start");
                this.update(sb);
              }
            }

            this.chunks.push((item.value as any).buffer);
            if (!item.msg) {
              reject(false);
              break;
            }
            const next = await kad.findValue(item.msg);
            console.log({ next });
            if (!next) {
              reject(false);
              break;
            }
            item = next;
          }
        } catch (error) {}
      });
    if (first) {
      await work().catch(console.error);
    }
  }
}
