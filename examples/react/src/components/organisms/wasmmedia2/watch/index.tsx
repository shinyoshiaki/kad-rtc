import React, { FC, useRef } from "react";
import { Content } from "../../../atoms/styled";
import useInput from "../../../../hooks/useInput";
import { RenderArraybuffer } from "../../../../../../../src";
import { kad } from "../../../../services/kademlia";
import { libvpxDec } from "../../../../domain/libvpx";
import { VideoCanvas } from "../../../atoms/videocanvas";
import { decode } from "@msgpack/msgpack";

const framesPerPacket = 2048;

const SuperMediaWatch: FC = () => {
  const [url, seturl] = useInput();
  const videoRef = useRef<any | undefined>(undefined);
  const audioRef = useRef<any | undefined>(undefined);

  const watch = async () => {
    const renderVideo = new RenderArraybuffer(kad);
    const buffer: Float32Array[] = [];

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
    renderVideo.buffer.subscribe(async uint8 => {
      await new Promise(r => setTimeout(r, 1 / 3));
      const chunk = decode(uint8) as { video: Uint8Array; audio: Uint8Array[] };
      const video = new Uint8Array(Object.values(chunk.video)).buffer;
      chunk.audio.forEach(audio => {
        const uint8 = new Uint8Array(Object.values(audio));
        buffer.push(new Float32Array(uint8.buffer));
      });
      sender.execute(video);
    });
    listener.subscribe(ab => {
      const ctx = videoRef.current.getContext("2d");
      const frame = ctx.createImageData(videoWidth, videoHeight);
      frame.data.set(ab, 0);
      ctx.putImageData(frame, 0, 0);
    });

    renderVideo.getVideo(url);

    const audioCtx = new AudioContext();
    const destination = audioCtx.createMediaStreamDestination();
    audioRef.current.srcObject = destination.stream;
    const playbackProcessor = audioCtx.createScriptProcessor(
      framesPerPacket,
      1,
      1
    );
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
    oscillator.connect(playbackProcessor).connect(audioCtx.destination);
    playbackProcessor.onaudioprocess = function(e) {
      const data = buffer.shift();
      if (!data) {
        return;
      }
      const outputBuffer = e.outputBuffer;
      const channel1 = outputBuffer.getChannelData(0);
      for (let i = 0; i < framesPerPacket; i++) {
        channel1[i] = data[i];
      }
    };
    oscillator.start();
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
      <video ref={audioRef} autoPlay />
    </Content>
  );
};

export default SuperMediaWatch;
