import React, { FC, useRef } from "react";
import useInput from "../../hooks/useInput";
import { ReceiveVideo } from "../../../../../src";
import { kad } from "../../services/kademlia";
import { Content } from "../atoms/styled";

const Watch: FC = () => {
  const [url, seturl] = useInput();
  const videoRef = useRef<any | undefined>(undefined);

  const watch = () => {
    const receiveVideo = new ReceiveVideo();
    receiveVideo.getVideo(
      url,
      ms => (videoRef.current.src = URL.createObjectURL(ms)),
      kad
    );
  };

  return (
    <Content>
      <input value={url} onChange={seturl} />
      <button onClick={watch}>watch</button>
      <video ref={videoRef} autoPlay={true} style={{ maxWidth: "100%" }} />
    </Content>
  );
};

export default Watch;
