import Kademlia from "../kad/kademlia";

export default class BroadCast {
  kad: Kademlia;
  constructor(kad: Kademlia) {
    this.kad = kad;
  }

  broadcast(msg: any) {
    this.kad.f.getAllPeers().forEach(peer => {
      peer.send(msg, "broadcast");
    });
  }
}
