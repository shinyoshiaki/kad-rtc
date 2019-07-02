import Event from "rx.mini";

const framerate = 30;

export function stream2ab(
  stream: MediaStream,
  { width, height }: { width: number; height: number }
) {
  const observer = new Event<ArrayBuffer>();
  new ReadableStream({
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
  }).pipeTo(
    new WritableStream({
      write(image) {
        observer.execute(image.data.buffer);
      }
    })
  );
  return observer;
}

export async function createAbDecorder(
  {
    width,
    height
  }: {
    width: number;
    height: number;
  },
  onMs: (ms: MediaSource) => void
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

  onMs(mediaSource);

  const action = new Event<ArrayBuffer>();
  action.subscribe(ab => worker.postMessage(ab, [ab]));

  return action;
}

export default async function webmTest(
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
  stream2ab(stream, { width, height }).subscribe(ab =>
    worker.postMessage(ab, [ab])
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
