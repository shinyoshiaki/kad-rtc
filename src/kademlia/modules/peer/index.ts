import Event from "../../../utill/event";

export default class Peer {
  kid: string = "";
  onData = new Event<string>();
  onDisconnect = new Event<undefined>();

  rpc(data: object, label: string) {}

  async open(data: string) {
    return new Peer();
  }
}
