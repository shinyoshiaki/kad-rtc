import React, { FC, useRef } from "react";
import { Content } from "../../../atoms/styled";
import useInput from "../../../../hooks/useInput";
import { RenderArraybuffer } from "../../../../../../../src";
import { kad } from "../../../../services/kademlia";
import { createAbDecorder } from "../../../../domain/webm";

const SuperMediaWatch: FC = () => {
  const [url, seturl] = useInput();
  const videoRef = useRef<any | undefined>(undefined);

  const watch = async () => {
    const renderVideo = new RenderArraybuffer(kad);
    const abDecoder = await createAbDecorder(
      { width: 640, height: 360 },
      ms => (videoRef.current.src = URL.createObjectURL(ms))
    );
    renderVideo.getVideo(url);
    renderVideo.observer.subscribe(abDecoder.execute);
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
