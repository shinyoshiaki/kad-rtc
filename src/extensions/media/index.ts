import { Kademlia } from "../..";
import { waitEvent, readAsArrayBuffer } from "./media";
import Event from "rx.mini";

const interval = 1000;

class Media {
  chunks: ArrayBuffer[] = [];
  stop: boolean = true;

  async update(sb: SourceBuffer) {
    this.stop = false;
    for (; this.stop === false; ) {
      if (sb.updating || !this.chunks || this.chunks.length === 0) {
        await new Promise(r => setTimeout(r, 10));
        continue;
      }
      console.log("chunks", this.chunks);
      const chunk = this.chunks.shift();
      if (!chunk) {
        await new Promise(r => setTimeout(r, 10));
        continue;
      }
      sb.appendBuffer(chunk);
      console.info("appendBuffer:", chunk.byteLength, "B");
      await waitEvent(sb, "updateend", undefined);
    }
  }

  stopMedia() {
    this.stop = false;
  }
}

export class StreamVideo extends Media {
  async recordInterval(
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
    this.update(sb);

    const first = await kad.findValue(headerKey);
    if (!first) return;

    const work = () =>
      new Promise<boolean>(async (resolve, reject) => {
        try {
          for (let item = first; ; ) {
            console.log({ item });
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
