import Peer from "../../../modules/peer/base";
import { FindValuePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";
import { FindValue, FindValueAnswer } from "..";
import { timeout } from "../../../const";
import { Item } from "../../../modules/kvs/base";

const FindValueResult = (data: Partial<{ item: Item; offers: Offer[] }>) => {
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
    const id = (data as any).id;
    const { kTable, rpcManager } = this.di;
    const { kvs } = this.di.modules;

    const item = kvs.get(key);

    if (item) {
      this.listen.rpc({ ...FindValueResult({ item }), id });
    } else {
      const peers = kTable.findNode(key);
      const offers: { peerkid: string; sdp: object }[] = [];

      const findValuePeerOffer = async (peer: Peer) => {
        if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
          const wait = rpcManager.getWait<FindValuePeerOffer>(
            peer,
            FindValueProxyOpen(this.listen.kid)
          );
          const res = await wait(timeout).catch(() => {});

          if (res) {
            const { peerkid, sdp } = res;
            if (sdp) offers.push({ peerkid, sdp });
          }
        }
      };

      await Promise.all(peers.map(peer => findValuePeerOffer(peer)));

      this.listen.rpc({ ...FindValueResult({ offers }), id });
    }
  }

  async findValueAnswer(data: FindValueAnswer) {
    const { sdp, peerkid } = data;
    const id = (data as any).id;
    const { kTable } = this.di;
    const peer = kTable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc({ ...FindValueProxyAnswer(sdp, this.listen.kid), id });
  }
}
