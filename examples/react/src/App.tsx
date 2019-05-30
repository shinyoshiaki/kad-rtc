import React, { useEffect, useState } from "react";
import guest, { kad } from "./guest";
import { storeFile, findFile } from "../../../src";
import { getSliceArrayBuffer } from "./util/file";
import { useApi } from "./hooks/useApi";
import { genKid } from "../../../src";
import { useObject } from "./hooks/useObject";
import styled from "styled-components";

const App: React.FC = () => {
  const [kid, setkid] = useState("");
  const [allPeers, setallPeers] = useState<string[]>([]);
  const fileobj = useObject({ storedkey: "", findkey: "" });
  const textobj = useObject({
    storedkey: "",
    findkey: "",
    value: "",
    view: ""
  });

  useEffect(() => {
    guest("http://localhost:60000");
    setInterval(() => {
      setkid(kad.kid);
      setallPeers(kad.di.kTable.allKids);
    }, 1000);
  }, []);

  const fileStore = useApi(async (e: any) => {
    if (!e) return undefined;
    const chunks = await getSliceArrayBuffer(e.target.files[0]);
    const key = await storeFile(chunks, kad as any);
    return key;
  });

  const fileFind = useApi(async (s: string) => {
    const chunks = await findFile(s, kad as any);
    console.log({ chunks });
    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    console.log({ url });
    const anchor = document.createElement("a");
    anchor.download = "file.png";
    anchor.href = url;
    anchor.click();
  });

  const storeText = useApi(async (s: string) => {
    const res = await kad.store(genKid(s), s);
    return res;
  });

  const findText = useApi(async (key: string) => {
    const res = await kad.findValue(key);
    return res;
  });

  return (
    <div>
      <p>{kid}</p>
      <Content>
        <p>file</p>
        <Content>
          <input
            type="file"
            onChange={async e => {
              if (!fileStore.loading) {
                const res = await fileStore.fetch(e);
                if (res) fileobj.setState({ storedkey: res });
              }
            }}
          />
          <p>{fileobj.storedkey}</p>
          {fileStore.loading && <p>doing</p>}
        </Content>
        <Content>
          <input
            onChange={e => fileobj.setState({ findkey: e.target.value })}
            value={fileobj.findkey}
          />
          <button
            onClick={() => {
              if (!fileFind.loading) {
                fileFind.fetch(fileobj.findkey);
                fileobj.setState({ findkey: "" });
              }
            }}
          >
            find file
          </button>
          {fileFind.loading && <p>doing</p>}
        </Content>
      </Content>
      <Content>
        <p>text</p>
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
                textobj.setState({ storedkey: res });
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
      </Content>
      <Content>
        <p>peers</p>
        {allPeers.map(kid => (
          <div key={kid}>{kid}</div>
        ))}
      </Content>
    </div>
  );
};

const Content = styled.div`
  border: solid 1px;
  padding: 15px;
  margin: 5px;
`;

export default App;
