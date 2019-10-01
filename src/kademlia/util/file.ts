const chunkSize = 16000;

export async function getSliceArrayBuffer(blob: Blob) {
  const r = new FileReader(),
    blobSlice = File.prototype.slice,
    chunkNum = Math.ceil(blob.size / chunkSize);
  const job = () =>
    new Promise<ArrayBuffer[]>((resolve, reject) => {
      let currentChunk = 0;
      r.onerror = e => {
        reject(e);
      };
      const chunks: ArrayBuffer[] = [];
      r.onload = e => {
        const chunk = (e.target as any).result;
        chunks.push(chunk);
        currentChunk++;
        if (currentChunk < chunkNum) {
          loadNext();
        } else {
          resolve(chunks);
        }
      };
      function loadNext() {
        const start = currentChunk * chunkSize;
        const end =
          start + chunkSize >= blob.size ? blob.size : start + chunkSize;
        r.readAsArrayBuffer(blobSlice.call(blob, start, end));
      }
      loadNext();
    });
  return await job();
}
