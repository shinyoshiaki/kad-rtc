import Event from "../../utill/event";

export default interface Peer {
  kid: string;
  onDisconnect: Event<undefined>;
  newConnect: () => boolean;
}
