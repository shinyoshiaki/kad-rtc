import React, { FC, useRef, useState, useEffect } from "react";
import { getLocalVideo } from "../../../../../src/webrtc/utill/media";
import { kad } from "../../services/kademlia";
import { StreamVideo } from "../../../../../src/extensions/media";
import useFile from "../../hooks/useFile";

const Record: FC<{ onStream?: (m: MediaStream) => void }> = ({ onStream }) => {
  const videoRef = useRef<any | undefined>(undefined);
  const ref = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();
  const [file, setfile] = useFile();

  const init = async () => {
    const stream = ref.current.captureStream();
    if (onStream) onStream(stream);

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
    if (file) {
      console.log({ file });
      ref.current.src = URL.createObjectURL(file);
    }
  }, [file]);

  return (
    <div>
      <p>{header}</p>
      <video ref={videoRef} autoPlay={true} style={{ maxWidth: "100%" }} />
      <input type="file" onChange={setfile} />
      <button onClick={init}>start</button>
      <video ref={ref} autoPlay={true} style={{ width: 0, height: 0 }} />
    </div>
  );
};

export default Record;
