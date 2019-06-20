import React, { FC, useRef } from "react";
import { Content } from "../../../atoms/styled";
import useInput from "../../../../hooks/useInput";
import { SuperReceiveVideo } from "../../../../../../../src";
import { kad } from "../../../../services/kademlia";

const SuperMediaWatch: FC = () => {
  const [url, seturl] = useInput();
  const videoRef = useRef<any | undefined>(undefined);

  const watch = () => {
    const receiveVideo = new SuperReceiveVideo(kad);
    receiveVideo.getVideo(
      url,
      ms => (videoRef.current.src = URL.createObjectURL(ms))
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

export default SuperMediaWatch;
