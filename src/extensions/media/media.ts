export async function getStream() {
  const stream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .catch(console.log);
  if (stream) {
    return stream;
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
    function _resolve(ev) {
      _removeListener();
      resolve(ev);
    }
    function _reject(ev) {
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
