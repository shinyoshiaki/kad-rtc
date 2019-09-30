import { FindValueProxyAnswer, FindValueProxyOpen } from "./node";

import { DependencyInjection } from "../../../di";
import { ID } from "../../../services/rpcmanager";
import { Peer } from "../../../modules/peer/base";
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
    const { finderkid, id } = data;
    const { kTable, signaling } = this.di;

    const { peer } = signaling.create(finderkid);

    if (peer) {
      this.candidates[finderkid] = peer;

      const offer = await peer.createOffer();

      this.listen.rpc({
        ...FindValuePeerOffer(kTable.kid, JSON.stringify(offer)),
        id
      });
    } else {
      this.listen.rpc({ ...FindValuePeerOffer(kTable.kid), id });
    }
  };

  findValueProxyAnswer = async (data: FindValueProxyAnswer) => {
    const { finderkid, sdp } = data;

    const peer = this.candidates[finderkid];
    if (!peer) return;
    const err = await peer.setAnswer(JSON.parse(sdp));
    if (!err) listeners(peer, this.di);
  };
}

const FindValuePeerOffer = (peerkid: string, sdp?: string) => ({
  rpc: "FindValuePeerOffer" as const,
  sdp,
  peerkid
});

export type FindValuePeerOffer = ReturnType<typeof FindValuePeerOffer>;