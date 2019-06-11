import WebRTC from "../../core";
import { mergeArraybuffer, sliceArraybuffer } from "../../utill/arraybuffer";

export default class ArrayBufferService {
  label = "w4me_file";
  private origin = "datachannel";

  private memory: ArrayBuffer[] = [];

  listen(peer: WebRTC) {
    peer.onData.subscribe(msg => {
      if (msg.label === this.label) {
        const data = msg.data;
        if (typeof data === "string") {
          const ab = mergeArraybuffer(this.memory);
          peer.onData.execute({
            label: msg.data,
            data: ab,
            nodeId: peer.nodeId
          });
          this.memory = [];
        } else {
          this.memory.push(data);
        }
      }
    });
  }

  async send(ab: ArrayBuffer, origin: string, rtc: RTCDataChannel) {
    this.origin = origin;
    console.log(this.origin, origin, ab);
    const chunks = sliceArraybuffer(ab, 16000);
    for (let chunk of chunks) {
      await new Promise(r => setTimeout(r));
      rtc.send(chunk);
    }
    rtc.send(origin);
  }
}
