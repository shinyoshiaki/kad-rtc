import Peer from "../../../modules/peer/base";
import { FindNode, FindNodeAnswer } from "..";
import { FindNodePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";

const FindNodeProxyOffer = (peers: Offer[]) => {
  return { rpc: "FindNodeProxyOffer" as const, peers };
};

export type Offer = { peerkid: string; sdp: any };

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (finderkid: string) => {
  return { rpc: "FindNodeProxyOpen" as const, finderkid };
};

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: any, finderkid: string) => {
  return { rpc: "FindNodeProxyAnswer" as const, sdp, finderkid };
};

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

type actions = FindNode | FindNodeAnswer;

export default class FindNodeProxy {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const discon = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "FindNode":
          this.findnode(data);
          break;
        case "FindNodeAnswer":
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

    const findNodePeerOffer = async (peer: Peer) => {
      if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
        peer.rpc(FindNodeProxyOpen(this.listen.kid));

        const res = await peer
          .eventRpc<FindNodePeerOffer>("FindNodePeerOffer")
          .asPromise(11111)
          .catch(() => {});

        if (res) {
          const { peerkid, sdp } = res;
          offers.push({ peerkid, sdp });
        }
      }
    };

    await Promise.all(peers.map(peer => findNodePeerOffer(peer)));

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
