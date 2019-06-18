export class Media {
  chunks: ArrayBuffer[] = [];
  stop: boolean = true;

  async update(sb: SourceBuffer) {
    this.stop = false;
    while (!this.stop) {
      if (sb.updating || this.chunks.length === 0) {
        await new Promise(r => setTimeout(r, 10));
      } else {
        const chunk = this.chunks.shift();
        try {
          if (chunk) {
            sb.appendBuffer(chunk);
            await waitEvent(sb, "updateend", undefined);
          } else await new Promise(r => setTimeout(r));
        } catch (error) {
          console.warn(error, chunk, sb);
        }
      }
    }
  }

  stopMedia() {
    this.stop = false;
  }
}

export function waitEvent(
  target: MediaSource | FileReader | SourceBuffer,
  event: string,
  error: any
) {
  return new Promise((resolve, reject) => {
    target.addEventListener(event, _resolve);
    if (typeof error === "string") {
      target.addEventListener(error, _reject);
    }
    function _removeListener() {
      target.removeEventListener(event, _resolve);
      if (typeof error === "string") {
        target.removeEventListener(error, _reject);
      }
    }
    function _resolve(ev: any) {
      _removeListener();
      resolve(ev);
    }
    function _reject(ev: any) {
      _removeListener();
      reject(ev);
    }
  });
}

export async function readAsArrayBuffer(blob: Blob) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(blob);
  return waitEvent(reader, "loadend", "error").then(() => reader.result);
}
