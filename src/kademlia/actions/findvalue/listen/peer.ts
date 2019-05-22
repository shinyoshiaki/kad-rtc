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
  candidates: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private di: DependencyInjection) {
    const onRpc = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "FindValueProxyOpen":
          this.findValueProxyOpen(data);
          break;
        case "FindValueProxyAnswer":
          this.findValueProxyAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => onRpc.unSubscribe());
  }

  async findValueProxyOpen(data: FindValueProxyOpen) {
    const { finderkid } = data;
    const id = (data as any).id;
    const { kTable, signaling } = this.di;

    const { peer } = signaling.create(finderkid);

    if (peer) {
      this.candidates[finderkid] = peer;

      const offer = await peer.createOffer();

      this.listen.rpc({ ...FindValuePeerOffer(offer, kTable.kid), id });
    }
  }

  async findValueProxyAnswer(data: FindValueProxyAnswer) {
    const { finderkid, sdp } = data;

    const peer = this.candidates[finderkid];
    if (!peer) return;
    await peer.setAnswer(sdp);

    listeners(peer, this.di);
  }
}
