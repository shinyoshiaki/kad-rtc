import React, { FC, useRef, useState } from "react";
import useFile from "../../../hooks/useFile";
import { VpxConfig, libvpxEnc, libvpxDec } from "../../../domain/libvpx";
import { VideoCanvas } from "../../atoms/videocanvas";

const LibvpxTest: FC = () => {
  const remoteRef = useRef<HTMLCanvasElement>(null);
  const localRef = useRef<any>(null);
  const [_, setfile, onSetfile] = useFile();
  const [source, setsource] = useState<{ width: number; height: number }>();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    localRef.current.onloadedmetadata = async ev => {
      let { videoHeight, videoWidth } = ev.target;
      setsource({ width: videoWidth, height: videoHeight });
      const canvas = remoteRef.current;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const config: VpxConfig = {
        codec: "VP8",
        width: videoWidth,
        height: videoHeight,
        fps: 30,
        bitrate: 10000,
        packetSize: 16
      };

      const enc = await libvpxEnc(stream, config);
      const dec = await libvpxDec(config);
      let time = 0;
      enc.listener.subscribe(ab => {
        console.log({ ab });
        time++;
        if (time > 10) {
          dec.sender.execute(ab.buffer as any);
        }
      });

      dec.listener.subscribe((ab: any) => {
        const ctx = remoteRef.current.getContext("2d");
        const frame = ctx.createImageData(videoWidth, videoHeight);
        frame.data.set(ab, 0);
        ctx.putImageData(frame, 0, 0);
      });
    };
  });

  return (
    <div>
      <p>libvpx</p>
      <input type="file" onChange={setfile} />
      <div style={{ display: "flex" }}>
        <video
          ref={localRef}
          autoPlay={true}
          style={{ width: 400, height: 400 }}
          muted
        />
        <VideoCanvas
          canvasRef={remoteRef}
          style={{ width: 400 }}
          source={source}
        />
      </div>
    </div>
  );
};

export default LibvpxTest;
