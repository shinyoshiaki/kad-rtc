import Peer from "../../modules/peer/base";
import Uuid from "../../../utill/uuid";
import Event from "rx.mini";

export type ID = { id: string };

export default class RpcManager {
  private uuid = new Uuid();

  getWait<T extends { rpc: string; [key: string]: unknown }>(
    peer: Peer,
    rpc: { rpc: string; [key: string]: any }
  ) {
    this.uuid.setPrefix(peer.kid);
    const id = this.uuid.get() + rpc.rpc;

    const event = new Event<T>();

    const onRpc = peer.onRpc.subscribe((v: T) => {
      if (v.id === id) {
        event.execute(v);
        onRpc.unSubscribe();
      }
    });

    peer.rpc({ ...rpc, id });

    return event.asPromise;
  }

  run(peer: Peer, rpc: { rpc: string; [key: string]: any }) {
    this.uuid.setPrefix(peer.kid);
    const id = this.uuid.get();
    peer.rpc({ ...rpc, id });
  }
}
