import React, { FC, useRef, useState, useEffect } from "react";

import { kad } from "../../services/kademlia";
import { StreamVideo } from "../../../../../src/extensions/media";
import useFile from "../../hooks/useFile";

const Record: FC<{}> = ({}) => {
  const videoRef = useRef<any | undefined>(undefined);
  const ref = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();
  const [file, setfile] = useFile();

  const init = async () => {
    const stream = ref.current.captureStream();

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
      init();
    };
    if (file) {
      start();
    }
  }, [file]);

  return (
    <div>
      <input type="file" onChange={setfile} />
      <p>{header}</p>
      <video ref={videoRef} autoPlay={true} style={{ maxWidth: "100%" }} />

      <video ref={ref} autoPlay={true} style={{ width: 0, height: 0 }} />
    </div>
  );
};

export default Record;
