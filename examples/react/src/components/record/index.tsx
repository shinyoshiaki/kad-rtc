import React, { FC, useRef, useState } from "react";
import { getLocalVideo } from "../../../../../src/webrtc/utill/media";
import { StreamVideo } from "../../../../../src";
import Event from "rx.mini";
import { kad } from "../../services/kademlia";
import sha1 from "sha1";

const Record: FC<{ onStream?: (m: MediaStream) => void }> = ({ onStream }) => {
  const videoRef = useRef<any | undefined>(undefined);
  const [header, setheader] = useState<string>();

  const init = async () => {
    const stream = await getLocalVideo();
    if (onStream) onStream(stream);
    const streamVideo = new StreamVideo();
    const event = new Event<ArrayBuffer>();

    let buffer: ArrayBuffer;
    event.once(ab => {
      buffer = ab;

      const work = (ab: ArrayBuffer) => {
        const key = sha1(Buffer.from(buffer)).toString();
        const msg = sha1(Buffer.from(ab)).toString();
        console.log(key, msg);
        kad.store(key, buffer, msg);
        buffer = ab;
      };

      event.once(ab => {
        const key = sha1(Buffer.from(buffer)).toString();
        setheader(key);
        work(ab);
        event.subscribe(ab => work(ab));
      });
    });

    streamVideo.recordInterval(stream, event as any, ms => {
      console.log({ ms });
      videoRef.current.src = URL.createObjectURL(ms);
    });
  };
  return (
    <div>
      <p>{header}</p>
      <button onClick={init}>start</button>
      <video ref={videoRef} autoPlay={true} />
    </div>
  );
};

export default Record;
