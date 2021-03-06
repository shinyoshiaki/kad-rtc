import { expose, wrap } from "../../../../vendor/airpc/main";
import { exposer, wrapper } from "../../rpc";

import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { FindValueSignaling } from "./signaling";

export function listenerFindValueProxy(listen: Peer, di: DependencyInjection) {
  expose(new FindValueProxy(listen, di), exposer(listen));
}

export class FindValueProxy {
  timeout = this.di.opt.timeout! / 2;
  constructor(private listen: Peer, private di: DependencyInjection) {}

  async findvalue(key: string, except: string[]) {
    const { kTable } = this.di;
    const { kvs } = this.di.modules;

    const item = kvs.get(key);

    if (item) {
      return { item };
    } else {
      const offers: { peerKid: string; sdp: string }[] = [];

      const peers = kTable
        .findNode(key)
        .filter(({ kid }) => kid !== this.listen.kid)
        .filter(({ kid }) => !except.includes(kid));

      await Promise.all(
        peers.map(async peer => {
          const actions = wrap(FindValueSignaling, wrapper(peer), this.timeout);
          const data = await actions
            .findValueProxyOpen(this.listen.kid)
            .catch(() => {});

          if (data) {
            const { offer, kid } = data;
            if (offer) offers.push({ peerKid: kid, sdp: offer });
          } else {
            console.log("timeout", "FindValueProxyOpen", peer.type);
          }
        })
      );
      return { offers };
    }
  }

  findValueAnswer(sdp: string, peerKid: string) {
    const { kTable } = this.di;

    const peer = kTable.getPeer(peerKid);
    if (!peer) return false;

    const actions = wrap(FindValueSignaling, wrapper(peer), this.timeout);
    actions.findValueProxyAnswer(this.listen.kid, sdp);
  }
}
