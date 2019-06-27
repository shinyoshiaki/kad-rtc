import React, { FC, useEffect, useRef } from "react";
import wasmTest from "../../../domain/webm";
import useFile from "../../../hooks/useFile";

const WasmTest: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localRef = useRef<any>(null);
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);

    const video = videoRef.current;
    if (video) {
      localRef.current.onloadedmetadata = async ev => {
        const { videoHeight, videoWidth } = ev.target;
        console.log(ev);
        const ms = await wasmTest(stream, {
          width: videoWidth,
          height: videoHeight
        });
        video.src = URL.createObjectURL(ms);
      };
    }
  });

  return (
    <div>
      <input type="file" onChange={setfile} />
      <div style={{ display: "flex" }}>
        <video
          ref={localRef}
          autoPlay={true}
          style={{ width: 400, height: 400 }}
          muted
        />
        <video
          ref={videoRef}
          autoPlay={true}
          style={{ width: 400, height: 400 }}
        />
      </div>
    </div>
  );
};

export default WasmTest;
