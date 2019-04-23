import Peer from "../../../modules/peer";
import { FindNode, FindNodeAnswer } from "..";
import Ktable from "../../../ktable";
import Event from "../../../../utill/event";
import findNodePeer, { FindNodePeerOffer } from "./peer";

const FindNodeProxyOffer = (peers: { kid: string; sdp: any }[]) => {
  return { rpc: "FindNodeProxyOffer" as const, peers };
};

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (kid: string) => {
  return { rpc: "FindNodeProxyOpen" as const, kid };
};

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: any, kid: string) => {
  return { rpc: "FindNodeProxyAnswer" as const, sdp, kid };
};

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

type actions = FindNode | FindNodeAnswer | FindNodePeerOffer;

export default class FindNodeProxy {
  constructor(private listen: Peer, private ktable: Ktable) {
    const disconnect = listen.onRpc.subscribe(async (data: actions) => {
      switch (data.rpc) {
        case "findnode":
          this.findnode(data);
          break;
        case "findnodeanswer":
          this.findnodeanswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => disconnect.unSubscribe());
  }

  async findnode(data: FindNode) {
    const { kid } = data;
    const peers = this.ktable.findNode(kid);
    const offers: { kid: string; sdp: any }[] = [];
    for (let peer of peers) {
      const rpc = peer.rpc(FindNodeProxyOpen(this.listen.kid));

      const res: actions = await rpc.asPromise();
      if (res.rpc === "FindNodePeerOffer") {
        const { kid, sdp } = res;
        offers.push({ kid, sdp });
      }
    }
    this.listen.rpc(FindNodeProxyOffer(offers));
  }

  async findnodeanswer(data: FindNodeAnswer) {
    const { sdp, kid } = data;
    const peer = this.ktable.getPeer(kid);
    if (!peer) return;
    peer.rpc(FindNodeProxyAnswer(sdp, this.listen.kid));
  }
}
