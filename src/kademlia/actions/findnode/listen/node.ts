import { FindNode, FindNodeAnswer } from "..";
import { ID, Peer } from "../../../modules/peer/base";

import { DependencyInjection } from "../../../di";
import { FindNodePeerOffer } from "./signaling";
import { Signal } from "webrtc4me";

export default class FindNodeProxy {
  timeout = this.di.opt.timeout! / 2;

  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;

    rpcManager
      .asObservable<FindNode>("FindNode", listen)
      .subscribe(this.findnode);

    rpcManager
      .asObservable<FindNodeAnswer>("FindNodeAnswer", listen)
      .subscribe(this.findNodeAnswer);
  }

  findnode = async (data: FindNode & ID) => {
    const { kTable, rpcManager } = this.di;
    const { searchKid, except, id } = data;

    const offers: { peerKid: string; sdp: Signal }[] = [];

    const peers = kTable
      .findNode(searchKid)
      .filter(({ kid }) => kid !== this.listen.kid)
      .filter(({ kid }) => !except.includes(kid));

    await Promise.all(
      peers.map(async peer => {
        const res = await rpcManager
          .getWait<FindNodePeerOffer>(
            peer,
            FindNodeProxyOpen(this.listen.kid)
          )(this.timeout)
          .catch(() => {});

        if (res) {
          const { peerKid, sdp } = res;
          if (sdp) offers.push({ peerKid, sdp });
        } else {
          console.log("timeout", "FindNodeProxyOpen", this.timeout, peer.type);
        }
      })
    );

    this.listen.rpc({ ...FindNodeProxyOffer(offers), id });
  };

  findNodeAnswer = async (data: FindNodeAnswer & ID) => {
    const { kTable } = this.di;
    const { sdp, peerKid, id } = data;

    const peer = kTable.getPeer(peerKid);
    if (peer) {
      peer.rpc({ ...FindNodeProxyAnswer(sdp, this.listen.kid), id });
    } else {
      this.listen.rpc({ ...FindNodeProxyAnswerError(), id });
    }
  };
}

export type OfferPayload = { peerKid: string; sdp: Signal };

const FindNodeProxyOffer = (peers: OfferPayload[]) => ({
  type: "FindNodeProxyOffer" as const,
  peers
});

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (finderKid: string) => ({
  type: "FindNodeProxyOpen" as const,
  finderKid
});

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: Signal, finderKid: string) => ({
  type: "FindNodeProxyAnswer" as const,
  sdp,
  finderKid
});

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

const FindNodeProxyAnswerError = () => ({
  type: "FindNodeProxyAnswerError" as const
});

export type FindNodeProxyAnswerError = ReturnType<
  typeof FindNodeProxyAnswerError
>;
