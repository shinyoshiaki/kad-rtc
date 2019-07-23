import { RPC, Peer } from "./base";
import Event from "rx.mini";
import WebRTC, { Signal } from "webrtc4me";
import { decode, encode } from "@msgpack/msgpack";
const wrtc = require("wrtc");

export const PeerModule = (kid: string) => new PeerWebRTC(kid);

export default class PeerWebRTC implements Peer {
  type = "webrtc";
  peer: WebRTC = new WebRTC({ disable_stun: true, wrtc });
  onRpc = new Event<RPC>();
  onDisconnect = new Event();
  onConnect = new Event<undefined | Error>();

  constructor(public kid: string) {
    this.peer.nodeId = kid;
    this.peer.onConnect.once(
      () => this.onConnect.execute(undefined),
      () => {},
      e => this.onConnect.execute(new Error(e))
    );
    this.peer.onDisconnect.once(() => this.onDisconnect.execute(null));
    const onData = this.peer.onData.subscribe(msg => {
      try {
        const { label, data } = msg;
        if (label == "datachannel" && typeof data !== "string") {
          const obj = this.parseRPC(data);
          if (obj) this.onRpc.execute(obj);
        }
      } catch (error) {
        console.error(error);
      }
    });
    this.onDisconnect.once(onData.unSubscribe);
  }

  parseRPC = (data: ArrayBuffer) => {
    const buffer = Buffer.from(data);
    try {
      const data: RPC = decode(buffer) as any;
      if (data.rpc) {
        return data;
      }
    } catch (error) {
      console.error(error, buffer);
    }
    return undefined;
  };

  rpc = (send: RPC) => {
    const packet = encode(send);
    this.peer.send(packet);
  };

  eventRpc = (rpc: string, id: string) => {
    const observer = new Event<any>();
    const onData = this.peer.onData.subscribe(msg => {
      const { data } = msg;
      if (typeof data !== "string") {
        const obj = this.parseRPC(data);
        if (obj && obj.rpc === rpc) {
          if (obj.id === id) {
            observer.execute(data);
            onData.unSubscribe();
          }
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

  setOffer = async (offer: Signal) => {
    this.peer.setSdp(offer);
    const answer = await this.peer.onSignal.asPromise();
    await new Promise(r => setTimeout(r, 0));
    return answer;
  };

  /** return ? error : success */
  setAnswer = async (answer: Signal): Promise<any> => {
    this.peer.setSdp(answer);
    await this.peer.onConnect.asPromise();
    return true;
  };

  disconnect = () => {
    this.peer.hangUp();
  };
}
