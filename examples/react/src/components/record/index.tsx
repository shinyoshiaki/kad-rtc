import React, { FC, useRef, useState, useEffect } from "react";

import { kad } from "../../services/kademlia";
import { StreamVideo } from "../../../../../src/extensions/media";
import useFile from "../../hooks/useFile";
import { getLocalVideo } from "../../../../../src/webrtc";

const Record: FC<{}> = ({}) => {
  const videoRef = useRef<any | undefined>(undefined);
  const ref = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();
  const [file, setfile] = useFile();

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

  useEffect(() => {
    const start = async () => {
      ref.current.src = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 1000));
      const stream = ref.current.captureStream();
      init(stream);
    };
    if (file) {
      start();
    }
  }, [file]);

  const webcam = async () => {
    const stream = await getLocalVideo();
    await new Promise(r => setTimeout(r, 1000));
    init(stream);
  };

  return (
    <div>
      <input type="file" onChange={setfile} />
      <button onClick={webcam}>webcam</button>
      <p>{header}</p>
      <video ref={videoRef} autoPlay={true} style={{ maxWidth: "100%" }} />
      <video ref={ref} autoPlay={true} style={{ width: 0, height: 0 }} />
    </div>
  );
};

export default Record;
