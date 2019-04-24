import Peer from "../../../modules/peer";
import { FindNode, FindNodeAnswer } from "..";
import Ktable from "../../../ktable";
import { FindNodePeerOffer } from "./peer";

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
  constructor(private listen: Peer, private ktable: Ktable) {
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
    const { finderkid } = data;
    const peers = this.ktable.findNode(finderkid);
    const offers: { peerkid: string; sdp: any }[] = [];
    for (let peer of peers) {
      if (peer.kid === finderkid) continue;

      const rpc = peer.rpc(FindNodeProxyOpen(this.listen.kid));

      const res: actions = await rpc.asPromise();
      if (res.rpc === "FindNodePeerOffer") {
        const { peerkid, sdp } = res;
        offers.push({ peerkid, sdp });
      }
    }
    this.listen.rpc(FindNodeProxyOffer(offers));
  }

  async findnodeanswer(data: FindNodeAnswer) {
    const { sdp, peerkid } = data;
    const peer = this.ktable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
  }
}
