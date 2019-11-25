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
    const { finderKid, id } = data;

    const { peer } = signaling.create(finderKid);

    if (peer) {
      this.candidates[finderKid] = peer;

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
    const { finderKid, sdp } = data;

    const peer = this.candidates[finderKid];
    if (!peer) return;
    const err = await peer.setAnswer(sdp);
    if (!err) listeners(peer, this.di);
  };
}

const FindNodePeerOffer = (peerKid: string, sdp?: Signal) => ({
  type: "FindNodePeerOffer" as const,
  sdp,
  peerKid
});

export type FindNodePeerOffer = ReturnType<typeof FindNodePeerOffer>;
