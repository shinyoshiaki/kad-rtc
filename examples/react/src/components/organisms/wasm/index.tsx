import React, { FC, useEffect, useRef } from "react";
import wasmTest from "../../../domain/wasm";

const WasmTest: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      (async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 400 },
            height: { ideal: 400 }
          },
          audio: false
        });
        const ms = await wasmTest(stream);
        video.src = URL.createObjectURL(ms);
      })();
    }
  }, [videoRef]);

  return (
    <div>
      <video ref={videoRef} autoPlay={true} />
    </div>
  );
};

export default WasmTest;
