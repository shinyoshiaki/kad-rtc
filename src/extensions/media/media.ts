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
