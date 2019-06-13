import React, { FC, useRef, useState } from "react";
import { Content } from "../../../atoms/styled";
import useFile from "../../../../hooks/useFile";
import { SuperStreamVideo } from "../../../../../../../src";
import { kad } from "../../../../services/kademlia";
import { getLocalVideo } from "../../../../../../../src/webrtc";

const SuperMediaRecord: FC = () => {
  const ref = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();
  const [_, setfile, onSetfile] = useFile();

  const init = async (stream: MediaStream) => {
    new SuperStreamVideo().streamViaKad(
      stream,
      s => {
        setheader(s);
      },
      kad
    );
  };

  onSetfile(async file => {
    ref.current.src = URL.createObjectURL(file);
    await new Promise(r => setTimeout(r, 1000));
    const stream = ref.current.captureStream();
    init(stream);
  });

  const webcam = async () => {
    const stream = await getLocalVideo();
    await new Promise(r => setTimeout(r, 1000));
    init(stream);
  };

  return (
    <Content>
      <input type="file" onChange={setfile} />
      <button onClick={webcam}>webcam</button>
      <p>{header}</p>
      <video ref={ref} autoPlay={true} style={{ maxWidth: "100%" }} />
    </Content>
  );
};

export default SuperMediaRecord;
