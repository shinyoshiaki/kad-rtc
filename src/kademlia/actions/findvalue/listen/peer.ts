import Peer from "../../../modules/peer/base";
import { DependencyInjection } from "../../../di";
import { listeners } from "../../../listeners";
import { FindValueProxyOpen, FindValueProxyAnswer } from "./proxy";

const FindValuePeerOffer = (sdp: any, peerkid: string) => {
  return { rpc: "FindValuePeerOffer" as const, sdp, peerkid };
};

export type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;

type actions = FindValueProxyOpen | FindValueProxyAnswer;

export default class FindValuePeer {
  signaling: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private di: DependencyInjection) {
    const discon = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "FindValueProxyOpen":
          this.findValueProxyOpen(data);
          break;
        case "FindValueProxyAnswer":
          this.findValueProxyAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => discon.unSubscribe());
  }

  async findValueProxyOpen(data: FindValueProxyOpen) {
    const { finderkid } = data;
    const { peerModule, kTable } = this.di;

    const peer = peerModule(finderkid);
    this.signaling[finderkid] = peer;

    const offer = await peer.createOffer();

    this.listen.rpc(FindValuePeerOffer(offer, kTable.kid));
  }

  async findValueProxyAnswer(data: FindValueProxyAnswer) {
    const { finderkid, sdp } = data;
    const { kTable } = this.di;

    const peer = this.signaling[finderkid];
    if (!peer) return;
    await peer.setAnswer(sdp);

    kTable.add(peer);
    listeners(peer, this.di);
  }
}
