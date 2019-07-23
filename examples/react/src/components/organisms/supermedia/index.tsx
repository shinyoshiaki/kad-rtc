import React, { FC } from "react";
import { Content } from "../../atoms/styled";
import SuperMediaRecord from "./record";
import SuperMediaWatch from "./watch";

const SuperMedia: FC = () => {
  return (
    <Content>
      <p>super media</p>
      <div style={{ display: "flex" }}>
        <SuperMediaWatch />
        <SuperMediaRecord />
      </div>
    </Content>
  );
};

export default SuperMedia;
