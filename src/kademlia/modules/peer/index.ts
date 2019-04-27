import Event from "../../../utill/event";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer {
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string }) => {};

  eventRpc = (rpc: string) => new Event<any>();

  createOffer = async (): Promise<any> => {};

  setOffer = async (sdp: any): Promise<any> => {};

  setAnswer = async (sdp: any): Promise<any> => {};

  disconnect = () => {};
}
