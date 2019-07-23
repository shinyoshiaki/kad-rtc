import React, { FC } from "react";
import { Content } from "../../atoms/styled";
import { useObject } from "../../../hooks/useObject";
import { useApi } from "../../../hooks/useApi";
import { kad } from "../../../services/kademlia";
import { genKid } from "../../../../../../src";

const TextShare: FC = () => {
  const textobj = useObject({
    storedkey: "",
    findkey: "",
    value: "",
    view: ""
  });

  const storeText = useApi(async (s: string) => {
    const res = await kad.store(genKid(s), s);
    return res;
  });

  const findText = useApi(async (key: string) => {
    const res = await kad.findValue(key);
    return res.value;
  });

  return (
    <Content>
      <p>text</p>
      <div style={{ display: "flex" }}>
        <Content>
          <input
            onChange={e => textobj.setState({ value: e.target.value })}
            value={textobj.value}
          />
          <button
            onClick={async () => {
              if (!storeText.loading) {
                const res = await storeText.fetch(textobj.value);
                textobj.setState({ value: "" });
                textobj.setState({ storedkey: res.key });
              }
            }}
          >
            store text
          </button>
          <p>{textobj.storedkey}</p>
          {storeText.loading && <p>doing</p>}
        </Content>
        <Content>
          <input
            onChange={e => textobj.setState({ findkey: e.target.value })}
            value={textobj.findkey}
          />
          <button
            onClick={async () => {
              if (!findText.loading) {
                const res = await findText.fetch(textobj.findkey);
                textobj.setState({ findkey: "" });
                if (typeof res === "string") {
                  textobj.setState({ view: res });
                }
              }
            }}
          >
            find text
          </button>
          <p>{textobj.view}</p>
          {findText.loading && <p>doing</p>}
        </Content>
      </div>
    </Content>
  );
};

export default TextShare;
