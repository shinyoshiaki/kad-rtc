export function sliceArraybuffer(
  arrayBuffer: ArrayBuffer,
  segmentSize: number
) {
  const segments: ArrayBuffer[] = [];
  let fi = 0;
  while (fi * segmentSize < arrayBuffer.byteLength) {
    segments.push(arrayBuffer.slice(fi * segmentSize, (fi + 1) * segmentSize));
    ++fi;
  }
  return segments;
}

export function mergeArraybuffer(segments: ArrayBuffer[]) {
  let sumLength = 0;
  for (let i = 0; i < segments.length; ++i) {
    sumLength += segments[i].byteLength;
  }
  let whole = new Uint8Array(sumLength);
  let pos = 0;
  for (let i = 0; i < segments.length; ++i) {
    whole.set(new Uint8Array(segments[i]), pos);
    pos += segments[i].byteLength;
  }
  return whole.buffer as ArrayBuffer;
}

export const blob2Arraybuffer = (blob: Blob) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = e => reject(e);
    r.onload = e => resolve((e.target as any).result);
    r.readAsArrayBuffer(blob);
  });
