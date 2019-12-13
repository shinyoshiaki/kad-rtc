import { decode, encode } from "@msgpack/msgpack";

import Event from "rx.mini";
import { Signal } from "webrtc4me";
import { Subject } from "rxjs";

export type ID = { id: string };

export type RPCBase = { type: string };

export type RPC = {
  type: string;
  [key: string]: string | Buffer | ArrayBuffer;
  id: string;
};

export type Peer = PeerClass & PeerProps;

class PeerClass {
  constructor(public kid: string) {}
}

type PeerProps = {
  type: string;
  SdpType: "offer" | "answer" | undefined;
  onRpc: Event<RPCBase & ID>;
  onDisconnect: Event;
  onConnect: Event;
  parseRPC: (data: ArrayBuffer) => RPC | undefined;
  rpc: (data: RPCBase & ID & { [key: string]: unknown }) => void;
  createOffer: () => Promise<Signal>;
  setOffer: (sdp: Signal) => Promise<Signal>;
  setAnswer: (sdp: Signal) => Promise<Error | undefined>;
  disconnect: () => void;
};

const peerMockSubject = new Subject<ArrayBuffer | string>();

export class PeerMock implements Peer {
  type = "mock";
  onData = new Event<RPC>();
  SdpType: "offer" | "answer" | undefined = undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();
  uuid = Math.random().toString() + Date.now();
  target = { uuid: "", port: 0 };

  constructor(public kid: string) {
    peerMockSubject.subscribe(data => {
      if (typeof data === "string") {
        if (data === "connect," + this.uuid) {
          this.onConnect.execute(null);
        }
        if (data === "disconnect," + this.uuid) {
          this.onDisconnect.execute(null);
          this.uuid = "";
        }
      } else {
        const obj = this.parseRPC(data);
        if (obj && obj.uuid === this.uuid) this.onRpc.execute(obj);
      }
    });
  }

  parseRPC = (data: ArrayBuffer) => {
    const buffer = Buffer.from(data);
    try {
      const data: RPC = decode(buffer) as any;
      if (data.type) {
        if (data.sdp) data.sdp = JSON.parse(data.sdp as any);
        return data;
      }
    } catch (error) {}
    return undefined;
  };

  rpc = async (send: RPCBase & ID & { [key: string]: unknown }) => {
    if (send.sdp) send.sdp = JSON.stringify(send.sdp);
    (send as any).uuid = this.target.uuid;
    const packet = encode(send);
    await new Promise(r => setTimeout(r));
    peerMockSubject.next(packet);
  };

  createOffer = async () => {
    this.SdpType = "offer";
    return { uuid: this.uuid } as any;
  };

  setOffer = async (sdp: any) => {
    this.SdpType = "answer";
    this.target.uuid = sdp.uuid;
    return { uuid: this.uuid } as any;
  };

  setAnswer = async (sdp: any) => {
    this.target.uuid = sdp.uuid;
    peerMockSubject.next("connect," + this.target.uuid);
    this.onConnect.execute(null);
    await new Promise(r => setTimeout(r, 0));

    return undefined;
  };

  disconnect = () => {
    this.uuid = "";
    this.onDisconnect.execute(null);
    peerMockSubject.next("disconnect," + this.target.uuid);
  };
}
