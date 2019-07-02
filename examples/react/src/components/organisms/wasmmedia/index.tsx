import React, { FC } from "react";
import { Content } from "../../atoms/styled";
import SuperMediaRecord from "./record";
import SuperMediaWatch from "./watch";

const WasmMedia: FC = () => {
  return (
    <Content>
      <p>wasm media</p>
      <div style={{ display: "flex" }}>
        <SuperMediaWatch />
        <SuperMediaRecord />
      </div>
    </Content>
  );
};

export default WasmMedia;
