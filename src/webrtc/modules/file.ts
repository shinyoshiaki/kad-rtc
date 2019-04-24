import WebRTC from "../core";
import { Subject, Observable } from "rxjs";

const chunkSize = 16000;

export function getSliceArrayBuffer(blob: Blob): Observable<any> {
  const subject = new Subject<Actions>();
  const state = subject.asObservable();

  const r = new FileReader(),
    blobSlice = File.prototype.slice,
    chunks = Math.ceil(blob.size / chunkSize);
  let currentChunk = 0;
  r.onerror = e => {
    subject.error(e);
  };
  r.onload = e => {
    const chunk = (e.target as any).result;
    currentChunk++;
    if (currentChunk < chunks) {
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

interface Action {
  type: string;
  payload: any;
}

interface Downloading extends Action {
  type: "downloading";
  payload: { now: number; size: number };
}

interface Downloaded extends Action {
  type: "downloaded";
  payload: { chunks: ArrayBuffer[]; name: string };
}

type Actions = Downloading | Downloaded;

export default class FileShare {
  subject = new Subject<Actions>();
  state = this.subject.asObservable();

  private chunks: ArrayBuffer[] = [];
  public name: string = "";
  private size: number = 0;

  constructor(private peer: WebRTC, public label?: string) {
    if (!label) label = "file";
    console.log({ label });
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
              this.subject.next({
                type: "downloaded",
                payload: { chunks: this.chunks, name: this.name }
              } as Downloaded);
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
          this.subject.next({
            type: "downloading",
            payload: { now: this.chunks.length * chunkSize, size: this.size }
          } as Downloading);
        }
      }
    });
  }

  sendStart(name: string, size: number) {
    this.name = name;
    this.peer.send(JSON.stringify({ state: "start", size, name }), this.label);
  }

  sendChunk(chunk: ArrayBuffer) {
    this.peer.send(chunk, this.label);
  }

  sendEnd() {
    this.peer.send(JSON.stringify({ state: "end" }), this.label);
  }

  send(blob: File) {
    this.sendStart(blob.name, blob.size);
    getSliceArrayBuffer(blob).subscribe(
      chunk => this.sendChunk(chunk),
      () => {},
      () => {
        this.sendEnd();
      }
    );
  }
}
