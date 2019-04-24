import Peer from "../../../modules/peer";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import Ktable from "../../../ktable";

const FindNodePeerOffer = (sdp: any, peerkid: string) => {
  return { rpc: "FindNodePeerOffer" as const, sdp, peerkid };
};

export type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;

type actions = FindNodeProxyOpen | FindNodeProxyAnswer;

export default class FindNodePeer {
  signaling: { [key: string]: Peer } = {};

  constructor(
    private module: (kid: string) => Peer,
    private listen: Peer,
    private ktable: Ktable
  ) {
    const discon = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "FindNodeProxyOpen":
          this.findNodeProxyOpen(data);
          break;
        case "FindNodeProxyAnswer":
          this.findNodeProxyAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => discon.unSubscribe());
  }

  async findNodeProxyOpen(data: FindNodeProxyOpen) {
    const { finderkid } = data;
    const peer = this.module(finderkid);
    this.signaling[finderkid] = peer;

    const offer = await peer.createOffer();

    this.listen.rpc(FindNodePeerOffer(offer, this.ktable.kid));
  }

  async findNodeProxyAnswer(data: FindNodeProxyAnswer) {
    const { finderkid, sdp } = data;
    const peer = this.signaling[finderkid];
    if (!peer) return;
    await peer.setAnswer(sdp);

    this.ktable.add(peer);
  }
}
