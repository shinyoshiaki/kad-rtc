import Base from "./base";
import Event from "../../../utill/event";

export const PeerModule = (kid: string) => new Peer(kid);

export default class Peer implements Base {
  private type = "mock";
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
    setTimeout(() => {
      if (this.send) this.send.excute({ data: send, label: send.rpc });
    }, 0);
  };

  eventRpc = (rpc: string) => {
    const observer = new Event<any>();
    const once = this.onData.subscribe(raw => {
      if (raw.label === rpc) {
        const data = raw.data;
        observer.excute(data);
        once.unSubscribe();
      }
    });
    return observer;
  };

  createOffer = async () => {
    return this.onData;
  };

  setOffer = async (sdp: Event<any>) => {
    this.send = sdp;
    return { send: this.onData, connect: this.onConnect };
  };

  setAnswer = async (sdp: { send: Event<any>; connect: Event<{}> }) =>
    new Promise<boolean>(resolve => {
      this.send = sdp.send;
      const connect: Event<{}> = sdp.connect;

      setTimeout(() => {
        connect.excute();
        this.onConnect.excute();

        resolve(true);
      }, 0);
    });

  disconnect = () => {};
}
