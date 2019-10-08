import { FindNode, FindNodeAnswer } from "..";
import { ID, Peer, RPCBase } from "../../../modules/peer/base";

import { DependencyInjection } from "../../../di";
import { FindNodePeerOffer } from "./signaling";
import { Signal } from "webrtc4me";

export default class FindNodeProxy {
  timeout = this.di.opt.timeout;

  constructor(private listen: Peer, private di: DependencyInjection) {
    const { rpcManager } = di;

    rpcManager
      .asObservable<FindNode>("FindNode", listen)
      .subscribe(this.findnode);

    rpcManager
      .asObservable<FindNodeAnswer>("FindNodeAnswer", listen)
      .subscribe(this.findnodeanswer);
  }

  findnode = async (data: FindNode & ID) => {
    const { kTable, rpcManager } = this.di;
    const { searchkid, except, id } = data;

    const offers: { peerkid: string; sdp: Signal }[] = [];

    const peers = kTable
      .findNode(searchkid)
      .filter(({ kid }) => kid !== this.listen.kid)
      .filter(({ kid }) => !except.includes(kid));

    await Promise.all(
      peers.map(async peer => {
        const wait = rpcManager.getWait<FindNodePeerOffer>(
          peer,
          FindNodeProxyOpen(this.listen.kid)
        );
        const res = await wait(this.timeout).catch(() => {
          return undefined;
        });
        if (res) {
          const { peerkid, sdp } = res;
          if (sdp) offers.push({ peerkid, sdp });
        }
      })
    );

    this.listen.rpc({ ...FindNodeProxyOffer(offers), id });
  };

  findnodeanswer = async (data: FindNodeAnswer & ID) => {
    const { kTable } = this.di;
    const { sdp, peerkid, id } = data;

    const peer = kTable.getPeer(peerkid);
    if (peer) peer.rpc({ ...FindNodeProxyAnswer(sdp, this.listen.kid), id });
    else {
      this.listen.rpc({ ...FindNodeProxyAnswerError(), id });
    }
  };
}

export type Offer = { peerkid: string; sdp: Signal };

const FindNodeProxyOffer = (peers: Offer[]) => ({
  type: "FindNodeProxyOffer" as const,
  peers
});

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (finderkid: string) => ({
  type: "FindNodeProxyOpen" as const,
  finderkid
});

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: Signal, finderkid: string) => ({
  type: "FindNodeProxyAnswer" as const,
  sdp,
  finderkid
});

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

const FindNodeProxyAnswerError = () => ({
  type: "FindNodeProxyAnswerError" as const
});

export type FindNodeProxyAnswerError = ReturnType<
  typeof FindNodeProxyAnswerError
>;
