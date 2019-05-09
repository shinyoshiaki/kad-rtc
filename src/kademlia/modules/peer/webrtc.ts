import Base from "./base";
import Event from "rx.mini";
import WebRTC from "../../../webrtc";
import * as bson from "bson";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  private peer: WebRTC = new WebRTC({ disable_stun: true });
  onRpc = new Event<any>();
  onDisconnect = this.peer.onDisconnect as any;
  onConnect = new Event<boolean>();

  constructor(public kid: string) {
    this.peer.nodeId = kid;
    this.peer.onConnect.once(() => {
      this.onConnect.excute(true);
    });
    const onData = this.peer.onData.subscribe(raw => {
      try {
        const buffer = Buffer.from(raw.data);
        const data = bson.deserialize(buffer);
        if (data.rpc) {
          this.onRpc.excute(data);
        }
      } catch (error) {
        console.error(error);
      }
    });
    this.peer.onDisconnect.once(() => {
      onData.unSubscribe();
    });
  }

  rpc = (send: {
    rpc: string;
    [key: string]: string | number | ArrayBuffer;
  }) => {
    const packet = bson.serialize(send);
    this.peer.send(packet, send.rpc);
  };

  eventRpc = (rpc: string) => {
    const observer = new Event<any>();
    const once = this.peer.onData.subscribe(raw => {
      if (raw.label === rpc) {
        const buffer = Buffer.from(raw.data);
        const data = bson.deserialize(buffer);
        observer.excute(data);
        once.unSubscribe();
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
    this.peer.disconnect();
  };
}
