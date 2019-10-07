import { FindNodeProxyAnswer, FindNodeProxyOpen } from "./node";
import { ID, Peer } from "../../../modules/peer/base";

import { DependencyInjection } from "../../../di";
import { Signal } from "webrtc4me";
import { listeners } from "../../../listeners";

export default class FindNodePeer {
  candidates: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;

    rpcManager
      .asObservable<FindNodeProxyOpen>("FindNodeProxyOpen", listen)
      .subscribe(this.findNodeProxyOpen);

    rpcManager
      .asObservable<FindNodeProxyAnswer>("FindNodeProxyAnswer", listen)
      .subscribe(this.findNodeProxyAnswer);
  }

  findNodeProxyOpen = async (data: FindNodeProxyOpen & ID) => {
    const { kTable, signaling } = this.di;
    const { finderkid, id } = data;

    const { peer } = signaling.create(finderkid);

    if (peer) {
      this.candidates[finderkid] = peer;

      const offer = await peer.createOffer();

      this.listen.rpc({
        ...FindNodePeerOffer(kTable.kid, offer),
        id
      });
    } else {
      this.listen.rpc({ ...FindNodePeerOffer(kTable.kid), id });
    }
  };

  findNodeProxyAnswer = async (data: FindNodeProxyAnswer) => {
    const { finderkid, sdp } = data;

    const peer = this.candidates[finderkid];
    if (!peer) return;
    const err = await peer.setAnswer(sdp);
    if (!err) listeners(peer, this.di);
  };
}

const FindNodePeerOffer = (peerkid: string, sdp?: Signal) => ({
  type: "FindNodePeerOffer" as const,
  sdp,
  peerkid
});

export type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
