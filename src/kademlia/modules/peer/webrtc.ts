import Base from ".";
import Event from "../../../utill/event";
import WebRTC from "../../../webrtc/core";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  private peer = new WebRTC();
  onRpc = new Event<any>();
  onDisconnect = this.peer.onDisconnect as any;
  onConnect = this.peer.onConnect as any;

  constructor(public kid: string) {
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
    return offer;
  };

  setOffer = async (sdp: any) => {
    this.peer.setSdp(sdp);
    const answer = await this.peer.onSignal.asPromise();
    return answer;
  };

  setAnswer = async (sdp: any) => {
    this.peer.setSdp(sdp);
    await this.peer.onConnect.asPromise();
    return true;
  };

  disconnect = () => {
    this.peer.disconnect();
  };
}
