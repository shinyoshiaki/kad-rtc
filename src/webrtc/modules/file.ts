import WebRTC from "../core";
import { Subject, Observable } from "rxjs";
import Event from "rx.mini";

const chunkSize = 16000;

export function getSliceArrayBuffer(blob: Blob): Observable<any> {
  const subject = new Subject<Actions>();
  const state = subject.asObservable();

  const r = new FileReader(),
    blobSlice = File.prototype.slice,
    chunknum = Math.ceil(blob.size / chunkSize);
  let currentChunk = 0;
  r.onerror = e => {
    subject.error(e);
  };
  r.onload = e => {
    const chunk = (e.target as any).result;
    currentChunk++;
    if (currentChunk <= chunknum) {
      loadNext();
      subject.next(chunk);
    } else {
      subject.complete();
    }
  };
  function loadNext() {
    const start = currentChunk * chunkSize;
    const end = start + chunkSize >= blob.size ? blob.size : start + chunkSize;
    r.readAsArrayBuffer(blobSlice.call(blob, start, end));
  }
  loadNext();
  return state;
}

const Downloading = (now: number, size: number) => {
  return {
    type: "downloading" as const,
    payload: { now, size }
  };
};

const Downloaded = (chunks: ArrayBuffer[], name: string) => {
  return {
    type: "downloaded" as const,
    payload: { chunks, name }
  };
};

type Actions = ReturnType<typeof Downloading> | ReturnType<typeof Downloaded>;

export default class FileShare {
  private chunks: ArrayBuffer[] = [];
  private name: string = "";
  private size: number = 0;
  event = new Event<Actions>();

  constructor(private peer: WebRTC, private label?: string) {
    if (!label) label = "file";
    peer.onData.subscribe(raw => {
      const { label, data } = raw;
      if (label === this.label) {
        try {
          const obj = JSON.parse(data);
          switch (obj.state) {
            case "start":
              this.chunks = [];
              this.name = obj.name;
              this.size = obj.size;
              break;
            case "end":
              this.event.execute(Downloaded(this.chunks, this.name));
              peer.send(
                JSON.stringify({ state: "complete", name: this.name }),
                this.label
              );
              this.chunks = [];
              this.name = "";
              break;
          }
        } catch (error) {
          this.chunks.push(data);
          this.event.execute(Downloading(this.chunks.length, this.size));
        }
      }
    });
  }

  private sendStart(name: string, size: number) {
    this.name = name;
    this.peer.send(JSON.stringify({ state: "start", size, name }), this.label);
  }

  private sendChunk(chunk: ArrayBuffer) {
    this.peer.send(chunk, this.label);
  }

  private sendEnd() {
    this.peer.send(JSON.stringify({ state: "end" }), this.label);
  }

  send(blob: File) {
    this.sendStart(blob.name, blob.size);
    getSliceArrayBuffer(blob).subscribe(
      chunk => this.sendChunk(chunk),
      () => {},
      () => this.sendEnd()
    );
  }
}
