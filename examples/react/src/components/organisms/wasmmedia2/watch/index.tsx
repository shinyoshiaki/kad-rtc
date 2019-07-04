import React, { FC, useRef } from "react";
import { Content } from "../../../atoms/styled";
import useInput from "../../../../hooks/useInput";
import { RenderArraybuffer } from "../../../../../../../src";
import { kad } from "../../../../services/kademlia";
import { libvpxDec } from "../../../../domain/libvpx";
import { VideoCanvas } from "../../../atoms/videocanvas";

const SuperMediaWatch: FC = () => {
  const [url, seturl] = useInput();
  const videoRef = useRef<any | undefined>(undefined);

  const watch = async () => {
    const renderVideo = new RenderArraybuffer(kad);

    const videoWidth = 400,
      videoHeight = 400;
    const { sender, listener } = await libvpxDec({
      codec: "VP8",
      width: videoWidth,
      height: videoHeight,
      fps: 30,
      bitrate: 10000,
      packetSize: 1
    });
    renderVideo.observer.subscribe(uint8 => {
      const ab = new Uint8Array(Object.values(uint8)).buffer;
      console.log(uint8, uint8.buffer, ab);
      sender.execute(ab);
    });
    listener.subscribe(ab => {
      const ctx = videoRef.current.getContext("2d");
      const frame = ctx.createImageData(videoWidth, videoHeight);
      frame.data.set(ab, 0);
      ctx.putImageData(frame, 0, 0);
    });

    renderVideo.getVideo(url);
  };

  return (
    <Content>
      <input value={url} onChange={seturl} />
      <button onClick={watch}>watch</button>
      <VideoCanvas
        canvasRef={videoRef as any}
        style={{ width: 400, height: 400 }}
        source={{ width: 400, height: 400 }}
      />
    </Content>
  );
};

export default SuperMediaWatch;
