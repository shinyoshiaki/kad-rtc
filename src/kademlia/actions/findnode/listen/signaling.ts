import { DependencyInjection } from "../../../di";
import { Peer } from "../../../modules/peer/base";
import { expose } from "../../../../vendor/airpc/main";
import { exposer } from "../../rpc";
import { listeners } from "../../../listeners";

export function listenerFindNodePeer(listen: Peer, di: DependencyInjection) {
  expose(new TestFindNodePeer(di), exposer(listen));
}

export class TestFindNodePeer {
  candidates: { [key: string]: Peer } = {};
  constructor(private di: DependencyInjection) {}

  async findNodeProxyOpen(finderKid: string) {
    const { kTable, signaling } = this.di;

    const { peer } = signaling.create(finderKid);

    if (peer) {
      this.candidates[finderKid] = peer;

      const offer = await peer.createOffer();

      return { kid: kTable.kid, offer: JSON.stringify(offer) };
    } else {
      return { kid: kTable.kid };
    }
  }

  async findNodeProxyAnswer(finderKid: string, sdp: string) {
    const peer = this.candidates[finderKid];
    if (!peer) return;
    const err = await peer.setAnswer(JSON.parse(sdp));
    if (!err) listeners(peer, this.di);
  }
}
