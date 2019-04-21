import Event from "../../utill/event";

export default interface Peer {
  kid: string;
  onDisconnect: Event<undefined>;
  onData: Event<string>;
  send: (msg: string) => any;
  setOffer: (sdp: string) => any;
  signal: Event<any>;
}
