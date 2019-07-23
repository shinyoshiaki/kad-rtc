import Event from "rx.mini";

const framerate = 30;

export async function stream2ab(
  stream: MediaStream,
  { width, height }: { width: number; height: number }
) {
  const observer = new Event<ArrayBuffer>();
  const worker = new Worker("node_modules/webm-wasm/dist/webm-worker.js");

  worker.postMessage("./webm-wasm.wasm");
  await nextEvent(worker, "message");
  worker.postMessage({
    width,
    height,
    realtime: true,
    bitrate: 20000
  });

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
        const ab = image.data.buffer;
        worker.postMessage(ab, [ab]);
      }
    })
  );

  worker.onmessage = ev => {
    if (ev.data) {
      observer.execute(ev.data);
    }
  };
  return observer;
}

export async function createAbDecorder(onMs: (ms: MediaSource) => void) {
  const mediaSource = new MediaSource();
  const chunks: ArrayBuffer[] = [];
  const action = new Event<ArrayBuffer>();
  mediaSource.onsourceopen = async () => {
    const sb = mediaSource.addSourceBuffer(`video/webm; codecs="vp8"`);
    action.subscribe((ab: any) => {
      console.log({ ab });
      try {
        chunks.push(ab);
      } catch (error) {
        console.warn(error);
      }
    });

    while (true) {
      if (sb.updating || chunks.length === 0) {
        await new Promise(r => setTimeout(r, 10));
      } else {
        const chunk: any = chunks.shift();
        try {
          if (chunk) {
            sb.appendBuffer(chunk.buffer);
            await waitEvent(sb, "updateend", undefined);
          } else await new Promise(r => setTimeout(r));
        } catch (error) {
          console.warn(error, chunk, sb);
        }
      }
    }
  };

  onMs(mediaSource);

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

  const mediaSource = new MediaSource();
  const chunks: ArrayBuffer[] = [];
  mediaSource.onsourceopen = async () => {
    const sb = mediaSource.addSourceBuffer(`video/webm; codecs="vp8"`);

    const observer = await stream2ab(stream, { width, height });
    observer.subscribe((ab: any) => {
      try {
        chunks.push(ab);
      } catch (error) {
        console.warn(error);
      }
    });

    let test = 0;

    while (true) {
      if (sb.updating || chunks.length === 0) {
        await new Promise(r => setTimeout(r, 10));
      } else {
        const chunk = chunks.shift();
        try {
          if (chunk) {
            test++;
            if (test > 20) {
              sb.appendBuffer(chunk);
              await waitEvent(sb, "updateend", undefined);
            }
          } else await new Promise(r => setTimeout(r));
        } catch (error) {
          console.warn(error, chunk, sb);
        }
      }
    }
  };

  return mediaSource;
}

function nextEvent(target, name) {
  return new Promise(resolve => {
    target.addEventListener(name, resolve, { once: true });
  });
}

function waitEvent(
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
