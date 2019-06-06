import Base, { RPC } from "./base";
import Event from "rx.mini";
import WebRTC from "../../../webrtc";
import * as bson from "bson";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  private peer: WebRTC = new WebRTC({ disable_stun: true });
  onRpc = new Event<RPC>();
  onDisconnect = this.peer.onDisconnect as any;
  onConnect = new Event<boolean>();

  constructor(public kid: string) {
    this.peer.nodeId = kid;
    this.peer.onConnect.once(() => {
      this.onConnect.execute(true);
    });
    const onData = this.peer.onData.subscribe(raw => {
      try {
        const data = this.parseRPC(raw.data);
        if (data) this.onRpc.execute(data);
      } catch (error) {
        console.error(error);
      }
    });
    this.peer.onDisconnect.once(() => {
      onData.unSubscribe();
    });
  }

  parseRPC = (data: ArrayBuffer) => {
    const buffer = Buffer.from(data);
    try {
      const data: RPC = bson.deserialize(buffer);
      if (data.rpc) {
        return data;
      }
    } catch (error) {
      console.error(error);
    }
    return undefined;
  };

  rpc = (send: RPC) => {
    const packet = bson.serialize(send);
    this.peer.send(packet);
  };

  eventRpc = (rpc: string, id: string) => {
    const observer = new Event<any>();
    const onData = this.peer.onData.subscribe(raw => {
      const data = this.parseRPC(raw.data);
      if (data && data.rpc === rpc) {
        if (data.id === id) {
          observer.execute(data);
          onData.unSubscribe();
        }
      }
    });
    return observer;
  };

  createOffer = async () => {
    this.peer.makeOffer();
    const offer = await this.peer.onSignal.asPromise();
    await new Promise(r => setTimeout(r, 0));
    return offer;
  };

  setOffer = async (offer: any) => {
    this.peer.setSdp(offer);
    const answer = await this.peer.onSignal.asPromise();
    await new Promise(r => setTimeout(r, 0));
    return answer;
  };

  setAnswer = async (answer: any) => {
    this.peer.setSdp(answer);
    await this.peer.onConnect.asPromise();
    return true;
  };

  disconnect = () => {
    this.peer.hangUp();
  };
}
