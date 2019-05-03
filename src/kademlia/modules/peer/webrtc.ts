import Base from "./base";
import Event from "../../../utill/event";
import WebRTC from "../../../webrtc";

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
    this.peer.nodeId = kid;
    const discon = this.peer.onData.subscribe(raw => {
      const data = JSON.parse(raw.data);
      if (data.rpc) {
        this.onRpc.excute(data);
      }
    });
    this.peer.onDisconnect.once(() => {
      discon.unSubscribe();
    });
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

  manageLimit = async () => {
    if (peerNum > 255) {
      peerStack.push(this.peer);
      peerNum++;
      // const discon = peerStack.shift();
      // await discon!.disconnect();
      // peerNum--;
    } else {
      peerStack.push(this.peer);
      peerNum++;
    }
    // console.log(peerNum);
  };

  createOffer = async () => {
    await this.manageLimit();

    this.peer.makeOffer();
    const offer = await this.peer.onSignal.asPromise();
    await new Promise(r => setTimeout(r, 0));
    return offer;
  };

  setOffer = async (offer: any) => {
    await this.manageLimit();

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
