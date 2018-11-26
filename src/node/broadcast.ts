import Kademlia from "../kad/kademlia";
import { message } from "webrtc4me/lib/interface";
import sha1 from "sha1";
import { IEvents, excuteEvent } from "../util";

export default class BroadCast {
  kad: Kademlia;
  hashs: string[] = [];
  onBroadcast: IEvents = {};
  events = { broadcast: this.onBroadcast };
  constructor(kad: Kademlia) {
    this.kad = kad;
  }

  broadcast(msg: string) {
    this.hashs.push(sha1(msg).toString());
    this.kad.f.getAllPeers().forEach(peer => {
      peer.send(msg, "broadcast");
    });
  }

  responder(message: message) {
    if (!(message.label === "broadcast")) return;

    const hash = sha1(message.data).toString();
    if (!this.hashs.includes(hash)) {
      this.hashs.push(hash);
      this.broadcast(message.data);
      excuteEvent(this.events.broadcast, message.data);
    }
  }
}
