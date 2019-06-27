const framerate = 30;

function cameraStream(
  stream: MediaStream,
  { width, height }: { width: number; height: number }
) {
  return new ReadableStream({
    async start(controller) {
      const cvs = document.createElement("canvas");
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.play();
      await nextEvent(video, "playing");
      [cvs.width, cvs.height] = [width, height];
      const ctx = cvs.getContext("2d");
      const frameTimeout = 1000 / framerate;
      setTimeout(async function f() {
        ctx.drawImage(video, 0, 0);
        await controller.enqueue(ctx.getImageData(0, 0, width, height));
        setTimeout(f, frameTimeout);
      }, frameTimeout);
    }
  });
}

export default async function wasmTest(
  stream: MediaStream,
  { width, height }: { width: number; height: number }
) {
  const worker = new Worker("node_modules/webm-wasm/dist/webm-worker.js");

  worker.postMessage("./webm-wasm.wasm");
  await nextEvent(worker, "message");
  worker.postMessage({
    width,
    height,
    realtime: true,
    bitrate: 20000
  });
  cameraStream(stream, { width, height }).pipeTo(
    new WritableStream({
      write(image) {
        worker.postMessage(image.data.buffer, [image.data.buffer]);
      }
    })
  );

  const mediaSource = new MediaSource();
  mediaSource.onsourceopen = () => {
    const sourceBuffer = mediaSource.addSourceBuffer(
      `video/webm; codecs="vp8"`
    );
    worker.onmessage = ev => {
      if (!ev.data) {
        return mediaSource.endOfStream();
      }
      try {
        console.log(ev.data);
        sourceBuffer.appendBuffer(ev.data);
      } catch (error) {}
    };
  };

  return mediaSource;
}

function nextEvent(target, name) {
  return new Promise(resolve => {
    target.addEventListener(name, resolve, { once: true });
  });
}
