import React, { FC, useRef, useState } from "react";

import { kad } from "../../../services/kademlia";
import { StreamVideo } from "../../../../../../src/extensions/media";
import useFile from "../../../hooks/useFile";
import { getLocalVideo } from "webrtc4me";
import { Content } from "../../atoms/styled";

const Record: FC<{}> = ({}) => {
  const videoRef = useRef<any | undefined>(undefined);
  const ref = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();
  const [_, setfile, onSetfile] = useFile();

  const init = async (stream: MediaStream) => {
    new StreamVideo().streamViaKad(
      stream,
      s => {
        setheader(s);
      },
      ms => {
        videoRef.current.src = URL.createObjectURL(ms);
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
      <video ref={videoRef} autoPlay={true} style={{ maxWidth: "100%" }} />
      <video ref={ref} autoPlay={true} style={{ width: 0, height: 0 }} />
    </Content>
  );
};

export default Record;
