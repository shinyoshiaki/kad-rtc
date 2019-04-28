import Peer from "../../../modules/peer";
import { FindNodeProxyOpen, FindNodeProxyAnswer } from "./proxy";
import { DependencyInjection } from "../../../di";
import { listeners } from "../../../listeners";

const FindNodePeerOffer = (sdp: any, peerkid: string) => {
  return { rpc: "FindNodePeerOffer" as const, sdp, peerkid };
};

export type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;

type actions = FindNodeProxyOpen | FindNodeProxyAnswer;

export default class FindNodePeer {
  signaling: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private di: DependencyInjection) {
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
    const { peerModule, kTable } = this.di;

    const peer = peerModule(finderkid);
    this.signaling[finderkid] = peer;

    const offer = await peer.createOffer();

    this.listen.rpc(FindNodePeerOffer(offer, kTable.kid));
  }

  async findNodeProxyAnswer(data: FindNodeProxyAnswer) {
    const { finderkid, sdp } = data;
    const { kTable } = this.di;

    const peer = this.signaling[finderkid];
    if (!peer) return;
    await peer.setAnswer(sdp);

    kTable.add(peer);
    listeners(peer, this.di);
  }
}
