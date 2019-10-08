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
  private onData = new Event<RPC>();
  private send: Event<any> | undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  constructor(public kid: string) {
    this.onData.subscribe(data => {
      try {
        if (data.type) {
          this.onRpc.execute(data);
        }
      } catch (error) {}
    });
  }

  rpc = async (data: { type: string; id: string }) => {
    await new Promise(r => setTimeout(r));
    this.send!.execute(data);
  };

  parseRPC = (data: ArrayBuffer) => undefined as any;

  eventRpc = (type: string, id: string) => {
    const observer = new Event<any>();
    const { unSubscribe } = this.onData.subscribe(data => {
      if (data.type === type && data.id === id) {
        observer.execute(data);
        unSubscribe();
      }
    });
    return observer;
  };

  createOffer = async () => this.onData as any;

  setOffer = async (sdp: any) => {
    this.send = sdp;
    return { send: this.onData, connect: this.onConnect } as any;
  };

  setAnswer = async (sdp: any) => {
    const { send, connect } = sdp;

    this.send = send;
    await new Promise(r => setTimeout(r, 0));

    connect.execute(null);
    this.onConnect.execute(null);

    return undefined;
  };

  disconnect = () => {};
}
