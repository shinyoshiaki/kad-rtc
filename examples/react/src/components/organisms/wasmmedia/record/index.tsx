import React, { FC, useRef, useState } from "react";
import { Content } from "../../../atoms/styled";
import useFile from "../../../../hooks/useFile";
import { kad } from "../../../../services/kademlia";
import { getLocalVideo } from "../../../../../../../src/webrtc";
import { stream2ab } from "../../../../domain/webm";
import { StreamArraybuffer } from "../../../../../../../src";

const SuperMediaRecord: FC = () => {
  const localRef = useRef<any>();
  const [header, setheader] = useState<string>();
  const [_, setfile, onSetfile] = useFile();

  onSetfile(async file => {
    let width: number, height: number;
    localRef.current.onloadedmetadata = async (ev: any) => {
      const { videoHeight, videoWidth } = ev.target;
      width = videoWidth;
      height = videoHeight;
    };
    localRef.current.src = URL.createObjectURL(file);
    const stream = localRef.current.captureStream(30);
    await new Promise(r => setTimeout(r, 1000));
    startStreamer(stream, { width, height });
  });

  const webcam = async () => {
    const stream = await getLocalVideo();

    localRef.current.onloadedmetadata = async (ev: any) => {
      const { videoHeight, videoWidth } = ev.target;
      startStreamer(stream, { width: videoWidth, height: videoHeight });
    };

    localRef.current = stream;
  };

  const startStreamer = async (
    stream: MediaStream,
    { width, height }: { width: number; height: number }
  ) => {
    console.log("start streamer");

    const streamer = new StreamArraybuffer();
    streamer.streamViaKad(kad, s => setheader(s));

    const observer = await stream2ab(stream, { width, height });
    observer.subscribe(ab => streamer.addAb(ab));
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
