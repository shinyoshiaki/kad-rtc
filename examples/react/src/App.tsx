import React, { useEffect, useState } from "react";
import guest, { kad } from "./services/kademlia";
import Watch from "./components/watch";
import Record from "./components/record";
import Peers from "./components/peers";
import FileShare from "./components/file";
import TextShare from "./components/text";
import { Content } from "./components/atoms/styled";

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
      <FileShare />
      <TextShare />
      <Content style={{ display: "flex" }}>
        <Watch />
        <Record />
      </Content>
      <Peers />
    </div>
  );
};

export default App;
