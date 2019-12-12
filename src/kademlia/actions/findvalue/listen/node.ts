import { FindValue, FindValueAnswer } from "..";
import { ID, Peer } from "../../../modules/peer/base";

import { DependencyInjection } from "../../../di";
import { FindValuePeerOffer } from "./signaling";
import { Item } from "../../../modules/kvs/base";
import { Signal } from "webrtc4me";

export default class FindValueProxy {
  timeout = this.di.opt.timeout! / 2;

  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;

    rpcManager
      .asObservable<FindValue>("FindValue", listen)
      .subscribe(this.findvalue);

    rpcManager
      .asObservable<FindValueAnswer>("FindValueAnswer", listen)
      .subscribe(this.findValueAnswer);
  }

  findvalue = async (data: FindValue & ID) => {
    const { kTable, rpcManager } = this.di;
    const { kvs } = this.di.modules;
    const { key, except, id } = data;

    const item = kvs.get(key);

    if (item) {
      this.listen.rpc({ ...FindValueResult({ item }), id });
    } else {
      const peers = kTable.findNode(key);
      const offers: { peerKid: string; sdp: Signal }[] = [];

      await Promise.all(
        peers.map(async peer => {
          if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
            const res = await rpcManager
              .getWait<FindValuePeerOffer>(
                peer,
                FindValueProxyOpen(this.listen.kid)
              )(this.timeout)
              .catch(() => {});

            if (res) {
              const { peerKid, sdp } = res;
              if (sdp) offers.push({ peerKid, sdp });
            } else {
              console.log("timeout", "FindValueProxyOpen", peer.type);
            }
          }
        })
      );

      this.listen.rpc({ ...FindValueResult({ offers }), id });
    }
  };

  findValueAnswer = (data: FindValueAnswer & ID) => {
    const { kTable } = this.di;
    const { sdp, peerKid, id } = data;

    const peer = kTable.getPeer(peerKid);
    if (!peer) return;
    peer.rpc({ ...FindValueProxyAnswer(sdp, this.listen.kid), id });
  };
}

const FindValueResult = (
  value: Partial<{ item: Item; offers: OfferPayload[] }>
) => ({
  type: "FindValueResult" as const,
  value
});

export type OfferPayload = { peerKid: string; sdp: Signal };

export type FindValueResult = ReturnType<typeof FindValueResult>;

const FindValueProxyOpen = (finderKid: string) => ({
  type: "FindValueProxyOpen" as const,
  finderKid
});

export type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;

const FindValueProxyAnswer = (sdp: Signal, finderKid: string) => ({
  type: "FindValueProxyAnswer" as const,
  sdp,
  finderKid
});

export type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;
