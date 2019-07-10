import React, { FC, useRef, useState } from "react";
import { decode, encode } from "@msgpack/msgpack";
import { Content } from "../../../atoms/styled";
import useFile from "../../../../hooks/useFile";
import { kad } from "../../../../services/kademlia";
import { getLocalVideo } from "../../../../../../../src/webrtc";
import { StreamArraybuffer } from "../../../../../../../src";
import { libvpxEnc } from "../../../../domain/libvpx";

const framesPerPacket = 2048;

const SuperMediaRecord: FC = () => {
  const localRef = useRef<any>();
  const [header, setheader] = useState<string>();
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    startStreamer(stream);
  });

  const webcam = async () => {
    const stream = await getLocalVideo();
    localRef.current = stream;
    startStreamer(stream);
  };

  const startStreamer = (stream: MediaStream) => {
    const video = localRef.current;

    if (video) {
      const streamer = new StreamArraybuffer();
      streamer.streamViaKad(kad, s => setheader(s));

      let audioChunks: Uint8Array[] = [];

      localRef.current.onloadedmetadata = async (ev: any) => {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(framesPerPacket, 1, 1);
        source.connect(processor);
        const destinationNode = audioCtx.createMediaStreamDestination();
        processor.onaudioprocess = e => {
          const channelData = e.inputBuffer.getChannelData(0);
          audioChunks.push(float32toInt8(channelData));
        };
        processor.connect(destinationNode);

        const { videoHeight, videoWidth } = ev.target;
        const { listener } = await libvpxEnc(stream, {
          codec: "VP8",
          width: 400,
          height: 400,
          fps: 30,
          bitrate: 10000,
          packetSize: 1
        });
        listener.subscribe(uint8 => {
          console.log({ audioChunks });
          const chunk = {
            video: uint8,
            audio: audioChunks
          };
          console.log("send", chunk, encode(chunk), decode(encode(chunk)));
          streamer.addAb(encode(chunk));
          audioChunks = [];
        });
      };
    }
  };

  return (
    <Content>
      <input type="file" onChange={setfile} />
      <button onClick={webcam}>webcam</button>
      <p>{header}</p>
      <video
        ref={localRef}
        autoPlay={true}
        muted
        style={{ maxWidth: "100%" }}
      />
    </Content>
  );
};

export default SuperMediaRecord;

const float32toInt8 = (f32: Float32Array): Uint8Array => {
  const buffer = new Buffer(f32.length * 4);
  for (var i = 0; i < f32.length; i++) {
    buffer.writeFloatLE(f32[i], i * 4);
  }
  return buffer;
};
