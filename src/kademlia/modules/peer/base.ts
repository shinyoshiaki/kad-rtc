import Event from "rx.mini";
import { Signal } from "webrtc4me";

export type RPC = {
  rpc: string;
  [key: string]: string | Buffer | ArrayBuffer;
  id: string;
};

export type Peer = PeerClass & PeerProps;

class PeerClass {
  constructor(public kid: string) {}
}

type PeerProps = {
  type: string;
  onRpc: Event<any>;
  onDisconnect: Event;
  onConnect: Event<undefined | Error>;
  parseRPC: (data: ArrayBuffer) => RPC | undefined;
  rpc: (data: { rpc: string; id: string }) => void;
  eventRpc: <T extends { rpc: string }>(rpc: T["rpc"], id: string) => Event<T>;
  createOffer: () => Promise<Signal>;
  setOffer: (sdp: Signal) => Promise<Signal>;
  setAnswer: (sdp: Signal) => Promise<string | null>;
  disconnect: () => void;
};

export class PeerMock implements Peer {
  type = "mock";
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event<undefined | Error>();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string; id: string }) => {};

  parseRPC = (data: ArrayBuffer) => undefined as any;

  eventRpc = <T extends { rpc: string }>(rpc: T["rpc"], id: string) =>
    new Event<T>();

  createOffer = async () => null as any;

  setOffer = async (sdp: Signal) => null as any;

  setAnswer = async (sdp: Signal) => null as any;

  disconnect = () => {};
}
