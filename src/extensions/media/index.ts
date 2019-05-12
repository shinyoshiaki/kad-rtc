import { Kademlia } from "../..";
import bson from "bson";
import { waitEvent, getStream, readAsArrayBuffer } from "./media";
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
    onMsReady: (ms: MediaSource) => void,
    eventChunk: Event<ArrayBuffer>
  ) {
    const stream = await getStream();
    if (!stream) {
      return;
    }

    const mimeType = `video/webm; codecs="opus,vp8"`;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType
    });
    const ms = new MediaSource();
    onMsReady(ms);

    await waitEvent(ms, "sourceopen", undefined);
    console.log("opend");

    const sb = ms.addSourceBuffer(mimeType);

    mediaRecorder.ondataavailable = async ({ data: blob }) => {
      const buf: undefined | ArrayBuffer = (await readAsArrayBuffer(
        blob
      )) as any;
      if (buf) {
        this.chunks.push(buf);
        eventChunk.excute(Buffer.from(buf));
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
    cb: (ms: MediaSource) => void,
    kad: Kademlia
  ) {
    const ms = new MediaSource();
    cb(ms);
    await waitEvent(ms, "sourceopen", undefined);
    const mimeType = `video/webm; codecs="opus,vp8"`;
    const sb = ms.addSourceBuffer(mimeType);
    this.update(sb);

    const first = await kad.findValue(headerKey);
    if (!first) return;
    const firstJson: { value: Buffer; next: string } = bson.deserialize(
      (first as any).buffer
    );
    console.log({ firstJson });

    const work = () =>
      new Promise<boolean>(async (resolve, reject) => {
        try {
          for (let json = firstJson; ; ) {
            this.chunks.push(json.value.buffer);
            if (!json.next) {
              resolve(true);
              break;
            }
            const value: any = await kad.findValue(json.next);
            if (!value) {
              reject(false);
              break;
            }
            json = bson.deserialize(value.buffer);
            console.log({ json });
          }
        } catch (error) {}
      });

    if (first) {
      await work().catch(console.error);
    }
  }
}
