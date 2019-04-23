import Event from "../../../utill/event";

export default class Peer {
  onRpc = new Event<any>();
  onDisconnect = new Event<undefined>();
  onSignal = new Event<any>();
  onConnect = new Event<undefined>();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string }) => new Event<any>();

  setSdp = (sdp: any) => {};

  createOffer = (): any => {};
}
