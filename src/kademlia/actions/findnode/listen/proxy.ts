import Peer from "../../../modules/peer/base";
import { FindNode, FindNodeAnswer } from "..";
import { FindNodePeerOffer } from "./peer";
import { DependencyInjection } from "../../../di";
import { timeout } from "../../../const";
import { ID } from "../../../services/rpcmanager";

const FindNodeProxyOffer = (peers: Offer[]) => ({
  rpc: "FindNodeProxyOffer" as const,
  peers
});

export type Offer = { peerkid: string; sdp: string };

export type FindNodeProxyOffer = ReturnType<typeof FindNodeProxyOffer>;

const FindNodeProxyOpen = (finderkid: string) => ({
  rpc: "FindNodeProxyOpen" as const,
  finderkid
});

export type FindNodeProxyOpen = ReturnType<typeof FindNodeProxyOpen>;

const FindNodeProxyAnswer = (sdp: string, finderkid: string) => ({
  rpc: "FindNodeProxyAnswer" as const,
  sdp,
  finderkid
});

export type FindNodeProxyAnswer = ReturnType<typeof FindNodeProxyAnswer>;

type actions = (FindNode | FindNodeAnswer) & ID;

export default class FindNodeProxy {
  constructor(private listen: Peer, private di: DependencyInjection) {
    const onRpc = listen.onRpc.subscribe((data: actions) => {
      switch (data.rpc) {
        case "FindNode":
          this.findnode(data);
          break;
        case "FindNodeAnswer":
          this.findnodeanswer(data);
          break;
      }
    });

    listen.onDisconnect.once(() => onRpc.unSubscribe());
  }

  async findnode(data: FindNode & ID) {
    const { kTable, rpcManager } = this.di;
    const { searchkid, except, id } = data;

    const peers = kTable.findNode(searchkid);
    const offers: { peerkid: string; sdp: string }[] = [];

    const findNodePeerOffer = async (peer: Peer) => {
      if (!(peer.kid === this.listen.kid || except.includes(peer.kid))) {
        const wait = rpcManager.getWait<FindNodePeerOffer>(
          peer,
          FindNodeProxyOpen(this.listen.kid)
        );
        const res = await wait(timeout).catch(() => {});

        if (res) {
          const { peerkid, sdp } = res;
          if (sdp) offers.push({ peerkid, sdp });
        }
      }
    };

    await Promise.all(peers.map(peer => findNodePeerOffer(peer)));

    this.listen.rpc({ ...FindNodeProxyOffer(offers), id });
  }

  async findnodeanswer(data: FindNodeAnswer & ID) {
    const { kTable } = this.di;
    const { sdp, peerkid, id } = data;

    const peer = kTable.getPeer(peerkid);
    if (!peer) return;
    peer.rpc({ ...FindNodeProxyAnswer(sdp, this.listen.kid), id });
  }
}
