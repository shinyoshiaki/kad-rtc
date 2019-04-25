import Base from ".";
import Event from "../../../utill/event";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "webrtc";
  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  onData = new Event<any>();
  send: Event<any> | undefined;

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
    const observer = new Event<any>();
    if (this.send) {
      this.send.excute({ data: send, label: send.rpc });
      this.onData.subscribe(raw => {
        const data = raw.data;
        if (raw.label === data.rpc) {
          observer.excute(data);
        }
      });
    }
    return observer;
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
