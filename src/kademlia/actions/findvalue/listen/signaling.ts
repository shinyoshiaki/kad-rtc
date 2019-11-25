import { FindValueProxyAnswer, FindValueProxyOpen } from "./node";
import { ID, Peer } from "../../../modules/peer/base";

import { DependencyInjection } from "../../../di";
import { Signal } from "webrtc4me";
import { listeners } from "../../../listeners";

export default class FindValuePeer {
  candidates: { [key: string]: Peer } = {};

  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;

    rpcManager
      .asObservable<FindValueProxyOpen>("FindValueProxyOpen", listen)
      .subscribe(this.findValueProxyOpen);

    rpcManager
      .asObservable<FindValueProxyAnswer>("FindValueProxyAnswer", listen)
      .subscribe(this.findValueProxyAnswer);
  }

  findValueProxyOpen = async (data: FindValueProxyOpen & ID) => {
    const { kTable, signaling } = this.di;
    const { finderKid, id } = data;

    const { peer } = signaling.create(finderKid);

    if (peer) {
      this.candidates[finderKid] = peer;

      const offer = await peer.createOffer();

      this.listen.rpc({
        ...FindValuePeerOffer(kTable.kid, offer),
        id
      });
    } else {
      this.listen.rpc({ ...FindValuePeerOffer(kTable.kid), id });
    }
  };

  findValueProxyAnswer = async (data: FindValueProxyAnswer) => {
    const { finderKid, sdp } = data;

    const peer = this.candidates[finderKid];
    if (!peer) return;
    const err = await peer.setAnswer(sdp);
    if (!err) listeners(peer, this.di);
  };
}

const FindValuePeerOffer = (peerKid: string, sdp?: Signal) => ({
  type: "FindValuePeerOffer" as const,
  sdp,
  peerKid
});

export type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;
