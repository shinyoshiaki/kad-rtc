import Event from "rx.mini";

export type VpxConfig = {
  codec: "VP8" | "VP9";
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  packetSize: number;
};

export async function libvpxEnc(stream: MediaStream, config: VpxConfig) {
  const listener = new Event<Uint8Array>();
  const vpxenc_ = new Worker("src/domain/libvpx/vpx-worker.js");
  vpxenc_.postMessage({ type: "init", data: config });

  const cvs = document.createElement("canvas");
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
  await nextEvent(video, "playing");
  const { width, height, fps } = config;
  [cvs.width, cvs.height] = [width, height];
  const ctx = cvs.getContext("2d");
  const frameTimeout = 1000 / fps;
  let encoding = false;
  (async () => {
    await new Promise(r => setTimeout(r, 1000));
    setInterval(() => {
      if (encoding) return;
      encoding = true;
      ctx.drawImage(video, 0, 0, width, height);
      const frame = ctx.getImageData(0, 0, width, height);
      vpxenc_.postMessage(
        {
          id: "enc",
          type: "call",
          name: "encode",
          args: [frame.data.buffer]
        },
        [frame.data.buffer]
      );
    }, frameTimeout);
  })();
  vpxenc_.onmessage = e => {
    encoding = false;
    if (e.data.res) {
      const encoded = new Uint8Array(e.data.res);
      listener.execute(encoded);
    }
  };
  return { listener };
}

export async function libvpxDec(config: VpxConfig) {
  const sender = new Event<ArrayBuffer>();
  const listener = new Event<ArrayBuffer>();
  const vpxdec_ = new Worker("src/domain/libvpx/vpx-worker.js");
  vpxdec_.postMessage({ type: "init", data: config });

  sender.subscribe(ab => {
    console.log({ ab });
    vpxdec_.postMessage(
      {
        id: "dec",
        type: "call",
        name: "decode",
        args: [ab]
      },
      [ab]
    );
  });

  vpxdec_.onmessage = e => {
    if (e.data.res) {
      const decoded = new Uint8Array(e.data.res);
      listener.execute(decoded);
    }
  };

  return { sender, listener };
}

function nextEvent(target, name) {
  return new Promise(resolve => {
    target.addEventListener(name, resolve, { once: true });
  });
}
