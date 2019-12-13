import { ExposerObject } from "../../vendor/airpc/main";
import { Peer } from "../modules/peer/base";
import { Subject } from "rxjs";

export const exposer = (listen: Peer) => {
  const subject = new Subject<ExposerObject>();
  listen.onRpc.subscribe((data: any) => {
    const value = data.value;
    if (data.type !== "airpc") return;
    subject.next({
      value,
      port: {
        postMessage: v => {
          listen.rpc({ type: "airpc", id: "", value: v });
        }
      }
    });
  });
  return subject;
};

export const wrapper = (peer: Peer) => {
  const subject = new Subject<Uint8Array>();
  peer.onRpc.subscribe((data: any) => {
    const value = data.value;
    if (data.type !== "airpc") return;
    subject.next(value);
  });
  const post = (uint8: Uint8Array) => {
    peer.rpc({ type: "airpc", id: "", value: uint8 });
  };
  return { subject, post };
};
