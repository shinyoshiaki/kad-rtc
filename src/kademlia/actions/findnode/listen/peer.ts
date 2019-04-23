import Peer from "../../../modules/peer";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import Ktable from "../../../ktable";

const FindNodePeerOffer = (sdp: any, kid: string) => {
  return { rpc: "FindNodePeerOffer" as const, sdp, kid };
};

export type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;

type actions = FindNodeProxyOpen | FindNodeProxyAnswer;

export default class FindNodePeer {
  signaling: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private ktable: Ktable) {
    const disconnect = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "FindNodeProxyOpen":
          this.findNodeProxyOpen(data);
          break;
        case "FindNodeProxyAnswer":
          this.findNodeProxyAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => disconnect.unSubscribe());
  }

  async findNodeProxyOpen(data: FindNodeProxyOpen) {
    const { kid } = data;
    const peer = new Peer(kid);
    this.signaling[kid] = peer;

    const offer = await peer.createOffer();

    this.listen.rpc(FindNodePeerOffer(offer, kid));
  }

  async findNodeProxyAnswer(data: FindNodeProxyAnswer) {
    const { kid, sdp } = data;
    const peer = this.signaling[kid];
    if (!peer) return;
    peer.setSdp(sdp);
    peer.onConnect.once(() => {
      this.ktable.add(peer);
    });
  }
}
