import Base from ".";
import Event from "../../../utill/event";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  private onData = new Event<any>();
  private send: Event<any> | undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  constructor(public kid: string) {
    this.onData.subscribe(raw => {
      try {
        const data = raw.data;
        if (data.rpc) {
          this.onRpc.excute(data);
        }
      } catch (error) {}
    });
  }

  rpc = (send: { rpc: string }) => {
    if (this.send) this.send.excute({ data: send, label: send.rpc });
  };

  promiseRpc = (rpc: string) => {
    const observer = new Event<any>();
    const once = this.onData.subscribe(raw => {
      if (raw.label === rpc) {
        const data = JSON.parse(raw.data);
        observer.excute(data);
        once.unSubscribe();
      }
    });
    return observer.asPromise();
  };

  createOffer = async () => {
    return this.onData;
  };

  setOffer = async (sdp: any) => {
    this.send = sdp;
    return { send: this.onData, connect: this.onConnect };
  };

  setAnswer = async (sdp: any) => {
    this.send = sdp.send;
    const connect: Event<{}> = sdp.connect;
    setTimeout(() => {
      connect.excute();
    }, 0);
    this.onConnect.excute();

    return true;
  };

  disconnect = () => {};
}
