import Peer from "../../../modules/peer/base";
import { FindValuePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";
import { FindValue, FindValueAnswer } from "..";
import { timeout } from "../../../const";

const FindValueResult = (
  data: Partial<{ value: string | ArrayBuffer; offers: Offer[] }>
) => {
  return { rpc: "FindValueResult" as const, data };
};

export type Offer = { peerkid: string; sdp: any };

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
    const onRpc = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "FindValue":
          this.findvalue(data);
          break;
        case "FindValueAnswer":
          this.findValueAnswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => onRpc.unSubscribe());
  }

  async findvalue(data: FindValue) {
    const { key, except } = data;
    const { kTable } = this.di;
    const { kvs } = this.di.modules;

    const value = kvs.get(key);

    if (value) {
      this.listen.rpc(FindValueResult({ value }));
    } else {
      const peers = kTable.findNode(key);
      const offers: { peerkid: string; sdp: any }[] = [];

      const findValuePeerOffer = async (peer: Peer) => {
        if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
          peer.rpc(FindValueProxyOpen(this.listen.kid));

          const res = await peer
            .eventRpc<FindValuePeerOffer>("FindValuePeerOffer")
            .asPromise(timeout)
            .catch(() => {});

          if (res) {
            const { peerkid, sdp } = res;
            if (typeof peerkid === "string") offers.push({ peerkid, sdp });
          }
        }
      };

      await Promise.all(peers.map(peer => findValuePeerOffer(peer)));

      this.listen.rpc(FindValueResult({ offers }));
    }
  }

  async findValueAnswer(data: FindValueAnswer) {
    const { sdp, peerkid } = data;
    const { kTable } = this.di;
    const peer = kTable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc(FindValueProxyAnswer(sdp, this.listen.kid));
  }
}
