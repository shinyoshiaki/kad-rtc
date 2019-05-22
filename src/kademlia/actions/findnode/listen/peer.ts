import Peer from "../../../modules/peer/base";
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
    const onRpc = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "FindNodeProxyOpen":
          this.findNodeProxyOpen(data);
          break;
        case "FindNodeProxyAnswer":
          this.findNodeProxyAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => onRpc.unSubscribe());
  }

  async findNodeProxyOpen(data: FindNodeProxyOpen) {
    const { finderkid } = data;
    const id = (data as any).id;
    const { kTable } = this.di;
    const { peerCreate } = this.di.modules;

    const peer = peerCreate(finderkid);
    this.signaling[finderkid] = peer;

    const offer = await peer.createOffer();

    this.listen.rpc({ ...FindNodePeerOffer(offer, kTable.kid), id });
  }

  async findNodeProxyAnswer(data: FindNodeProxyAnswer) {
    const { finderkid, sdp } = data;

    const peer = this.signaling[finderkid];
    if (!peer) return;
    await peer.setAnswer(sdp);

    listeners(peer, this.di);
  }
}
