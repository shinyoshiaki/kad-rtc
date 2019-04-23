import Base from ".";
import Event from "../../../utill/event";
import WebRTC from "webrtc4me";

export default class Peer implements Base {
  onRpc = new Event<any>();
  onDisconnect = new Event<undefined>();
  onSignal = new Event<any>();
  onConnect = new Event<undefined>();
  private peer = new WebRTC();

  constructor(public kid: string) {}

  rpc = (data: { rpc: string }) => {
    const observer = new Event<any>();
    this.peer.send(JSON.stringify(data), data.rpc);
    const discon = this.peer.onData.subscribe(raw => {
      if (raw.label === data.rpc) {
        observer.excute(raw.data);
      }
    });
    this.peer.onDisconnect.once(() => discon.unSubscribe());
    return observer;
  };

  setSdp = (sdp: any) => {
    this.peer.setSdp(sdp);
  };

  createOffer = async () => {
    this.peer.makeOffer();
    const offer = await this.peer.onSignal.asPromise();
    return offer;
  };
}
