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
    localRef.current.src = URL.createObjectURL(file);
    await new Promise(r => setTimeout(r, 1000));
    const stream = localRef.current.captureStream();
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
        stream2ab(stream, { width: videoWidth, height: videoHeight }).subscribe(
          ab => streamer.addAb(ab)
        );
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
