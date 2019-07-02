import React, { useEffect, useState } from "react";
import guest, { kad } from "./services/kademlia";
import Watch from "./components/organisms/watch";
import Record from "./components/organisms/record";
import Peers from "./components/organisms/peers";
import FileShare from "./components/organisms/file";
import TextShare from "./components/organisms/text";
import { Content } from "./components/atoms/styled";
import SuperMedia from "./components/organisms/supermedia";
import WebmTest from "./components/organisms/webm";

const App: React.FC = () => {
  const [kid, setkid] = useState("");

  useEffect(() => {
    guest("http://localhost:60000");
    setInterval(() => {
      setkid(kad.kid);
    }, 1000);
  }, []);

  return (
    <div>
      <p>{kid}</p>
      <WebmTest />
      <FileShare />
      <TextShare />
      <Content style={{ display: "flex" }}>
        <Watch />
        <Record />
      </Content>
      <SuperMedia />
      <Peers />
    </div>
  );
};

export default App;
