import React, { FC } from "react";
import { Content } from "../atoms/styled";
import { useObject } from "../../hooks/useObject";
import { useApi } from "../../hooks/useApi";
import { getSliceArrayBuffer } from "../../util/file";
import { storeFile, findFile } from "../../../../../src";
import { kad } from "../../services/kademlia";

const FileShare: FC = () => {
  const fileobj = useObject({ storedkey: "", findkey: "" });

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

  return (
    <Content>
      <p>file</p>
      <div style={{ display: "flex" }}>
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
      </div>
    </Content>
  );
};

export default FileShare;
