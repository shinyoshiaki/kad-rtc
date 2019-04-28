import Peer from "../../../modules/peer";
import { FindNode, FindNodeAnswer } from "..";
import { FindNodePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";

const FindNodeProxyOffer = (peers: { peerkid: string; sdp: any }[]) => {
  return { rpc: "FindNodeProxyOffer" as const, peers };
};

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (finderkid: string) => {
  return { rpc: "FindNodeProxyOpen" as const, finderkid };
};

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: any, finderkid: string) => {
  return { rpc: "FindNodeProxyAnswer" as const, sdp, finderkid };
};

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

type actions = FindNode | FindNodeAnswer | FindNodePeerOffer;

export default class FindNodeProxy {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const discon = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "findnode":
          this.findnode(data);
          break;
        case "findnodeanswer":
          this.findnodeanswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => discon.unSubscribe());
  }

  async findnode(data: FindNode) {
    const { searchkid, except } = data;
    const { kTable } = this.di;
    const peers = kTable.findNode(searchkid);
    const offers: { peerkid: string; sdp: any }[] = [];

    for (let peer of peers) {
      if (peer.kid === this.listen.kid) continue;
      if (except.includes(peer.kid)) continue;

      peer.rpc(FindNodeProxyOpen(this.listen.kid));

      const res: FindNodePeerOffer = await peer
        .eventRpc("FindNodePeerOffer")
        .asPromise();
      const { peerkid, sdp } = res;
      offers.push({ peerkid, sdp });
    }
    this.listen.rpc(FindNodeProxyOffer(offers));
  }

  async findnodeanswer(data: FindNodeAnswer) {
    const { sdp, peerkid } = data;
    const { kTable } = this.di;
    const peer = kTable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
  }
}
