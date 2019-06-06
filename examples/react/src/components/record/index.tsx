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

    streamVideo.recordInterval(stream, event as any, ms => {
      console.log({ ms });
      videoRef.current.src = URL.createObjectURL(ms);
    });

    let buffer: ArrayBuffer = await event.asPromise();
    const key = sha1(Buffer.from(buffer)).toString();
    setheader(key);
    const chunks: ArrayBuffer[] = [];
    event.subscribe(async ab => {
      chunks.push(ab);
      console.log(chunks);
    });
    while (true) {
      const ab = chunks.shift();
      if (ab) {
        const key = sha1(Buffer.from(buffer)).toString();
        const msg = sha1(Buffer.from(ab)).toString();
        kad.store(key, buffer, msg).then(res => console.log(res));
        buffer = ab;
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
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
