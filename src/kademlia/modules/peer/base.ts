import Event from "rx.mini";

export const PeerModule = (kid: string) => new Peer(kid);

export type RPC = {
  rpc: string;
  [key: string]: string | Buffer | ArrayBuffer;
  id: string;
};

export default class Peer {
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event<boolean>();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string; id: string }) => {};

  eventRpc = <T extends { rpc: string }>(rpc: T["rpc"], id: string) =>
    new Event<T>();

  createOffer = async (): Promise<any> => {};

  setOffer = async (sdp: any): Promise<any> => {};

  setAnswer = async (sdp: any): Promise<any> => {};

  disconnect = () => {};
}
