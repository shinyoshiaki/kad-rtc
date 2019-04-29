import Base from "./base";
import Event from "../../../utill/event";
import WebRTC from "webrtc4me";

let peerNum = 0;
const peerStack: WebRTC[] = [];

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  private peer: WebRTC = new WebRTC({ disable_stun: true });
  onRpc = new Event<any>();
  onDisconnect = this.peer.onDisconnect as any;
  onConnect = this.peer.onConnect as any;

  constructor(public kid: string) {
    if (peerNum > 250) {
      const discon = peerStack.shift();
      discon!.disconnect();
      peerNum--;
    } else {
      peerStack.push(this.peer);
      peerNum++;
    }

    const discon = this.peer.onData.subscribe(raw => {
      try {
        const data = JSON.parse(raw.data);
        if (data.rpc) {
          this.onRpc.excute(data);
        }
      } catch (error) {}
    });
    this.peer.onDisconnect.once(() => discon.unSubscribe());
  }

  rpc = (send: { rpc: string }) => {
    this.peer.send(JSON.stringify(send), send.rpc);
  };

  eventRpc = (rpc: string) => {
    const observer = new Event<any>();
    const once = this.peer.onData.subscribe(raw => {
      if (raw.label === rpc) {
        const data = JSON.parse(raw.data);
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
