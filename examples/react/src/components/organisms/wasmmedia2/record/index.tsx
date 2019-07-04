import React, { FC, useRef, useState } from "react";
import { Content } from "../../../atoms/styled";
import useFile from "../../../../hooks/useFile";
import { kad } from "../../../../services/kademlia";
import { getLocalVideo } from "../../../../../../../src/webrtc";
import { StreamArraybuffer } from "../../../../../../../src";
import { libvpxEnc } from "../../../../domain/libvpx";

const SuperMediaRecord: FC = () => {
  const localRef = useRef<any>();
  const [header, setheader] = useState<string>();
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    console.log("stream");
    startStreamer(stream);
  });

  const webcam = async () => {
    const stream = await getLocalVideo();
    localRef.current = stream;
    startStreamer(stream);
  };

  const startStreamer = (stream: MediaStream) => {
    const video = localRef.current;

    const streamer = new StreamArraybuffer();
    streamer.streamViaKad(kad, s => setheader(s));

    if (video) {
      localRef.current.onloadedmetadata = async (ev: any) => {
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
          streamer.addAb(uint8);
        });
      };
    }
  };

  return (
    <Content>
      <input type="file" onChange={setfile} />
      <button onClick={webcam}>webcam</button>
      <p>{header}</p>
      <video ref={localRef} autoPlay={true} style={{ maxWidth: "100%" }} />
    </Content>
  );
};

export default SuperMediaRecord;
