import { expose, wrap } from "../../../../vendor/airpc/main";
import { exposer, wrapper } from "../../rpc";

import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { TestFindNodePeer } from "./signaling";

export function listenerFindNodeProxy(listen: Peer, di: DependencyInjection) {
  expose(new FindNodeProxy(listen, di), exposer(listen));
}

export class FindNodeProxy {
  timeout = this.di.opt.timeout! / 2;

  constructor(private listen: Peer, private di: DependencyInjection) {}

  async findnode(searchKid: string, except: string[]) {
    const { kTable } = this.di;

    const offers: { peerKid: string; sdp: string }[] = [];

    const peers = kTable
      .findNode(searchKid)
      .filter(({ kid }) => kid !== this.listen.kid)
      .filter(({ kid }) => !except.includes(kid));

    await Promise.all(
      peers.map(async peer => {
        const actions = wrap(TestFindNodePeer, wrapper(peer), this.timeout);

        const data = await actions
          .findNodeProxyOpen(this.listen.kid)
          .catch(() => {});
        if (data) {
          const { offer, kid } = data;
          if (offer) offers.push({ peerKid: kid, sdp: offer });
        }
      })
    );

    return offers;
  }

  findNodeAnswer(sdp: string, peerKid: string) {
    const { kTable } = this.di;

    const peer = kTable.getPeer(peerKid);
    if (!peer) return false;

    const actions = wrap(TestFindNodePeer, wrapper(peer), this.timeout);
    actions.findNodeProxyAnswer(this.listen.kid, sdp);
  }
}
