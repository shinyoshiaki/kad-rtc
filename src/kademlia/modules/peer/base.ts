import Event from "rx.mini";
import { Signal } from "webrtc4me";

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
  onRpc: Event<RPCBase & ID>;
  onDisconnect: Event;
  onConnect: Event;
  parseRPC: (data: ArrayBuffer) => RPC | undefined;
  rpc: (data: RPCBase & ID & { [key: string]: unknown }) => void;
  eventRpc: <T extends { type: string }>(
    rpc: T["type"],
    id: string
  ) => Event<T>;
  createOffer: () => Promise<Signal>;
  setOffer: (sdp: Signal) => Promise<Signal>;
  setAnswer: (sdp: Signal) => Promise<Error | undefined>;
  disconnect: () => void;
};

export class PeerMock implements Peer {
  type = "mock";
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  constructor(public kid: string) {}

  rpc = (data: { type: string; id: string }) => {};

  parseRPC = (data: ArrayBuffer) => undefined as any;

  eventRpc = <T extends { type: string }>(rpc: T["type"], id: string) =>
    new Event<T>();

  createOffer = async () => null as any;

  setOffer = async (sdp: Signal) => null as any;

  setAnswer = async (sdp: Signal) => null as any;

  disconnect = () => {};
}
