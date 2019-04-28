import Peer from "../../../modules/peer";
import { FindValuePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";
import { FindValue, FindValueAnswer } from "..";

const FindValueResult = (
  data: Partial<{ value: string; offers: { peerkid: string; sdp: any }[] }>
) => {
  return { rpc: "FindValueResult" as const, data };
};

export type FindValueResult = ReturnType<typeof FindValueResult>;

const FindValueProxyOpen = (finderkid: string) => {
  return { rpc: "FindValueProxyOpen" as const, finderkid };
};

export type FindValueProxyOpen = ReturnType<typeof FindValueProxyOpen>;

const FindValueProxyAnswer = (sdp: any, finderkid: string) => {
  return { rpc: "FindValueProxyAnswer" as const, sdp, finderkid };
};

export type FindValueProxyAnswer = ReturnType<typeof FindValueProxyAnswer>;

type actions = FindValue | FindValueAnswer;

export default class FindValueProxy {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const discon = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "FindValue":
          this.findvalue(data);
          break;
        case "FindValueAnswer":
          this;
          break;
      }
    });

    listen.onDisconnect.once(() => discon.unSubscribe());
  }

  async findvalue(data: FindValue) {
    const { key, except } = data;
    const { kTable, kvs } = this.di;

    const value = kvs.get(key);

    if (value) {
      this.listen.rpc(FindValueResult({ value }));
    } else {
      const peers = kTable.findNode(key);
      const offers: { peerkid: string; sdp: any }[] = [];

      for (let peer of peers) {
        if (peer.kid === this.listen.kid) continue;
        if (except.includes(peer.kid)) continue;

        peer.rpc(FindValueProxyOpen(this.listen.kid));

        const res = await peer
          .eventRpc<FindValuePeerOffer>("FindValuePeerOffer")
          .asPromise();
        const { peerkid, sdp } = res;
        offers.push({ peerkid, sdp });
      }
      this.listen.rpc(FindValueResult({ offers }));
    }
  }

  async findnodeanswer(data: FindValueAnswer) {
    const { sdp, peerkid } = data;
    const { kTable } = this.di;
    const peer = kTable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc(FindValueProxyAnswer(sdp, this.listen.kid));
  }
}
