import Event from "../../../utill/event";

export default class Peer {
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onSignal = new Event<any>();
  onConnect = new Event();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string }) => new Event<any>();

  setSdp = (sdp: any) => {};

  createOffer = async (): Promise<any> => {};

  setOffer = async (sdp: any): Promise<any> => {};

  setAnswer = async (sdp: any) => {};
}
