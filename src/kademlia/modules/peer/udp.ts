import * as dgram from "dgram";

import { ID, Peer, RPC, RPCBase } from "./base";
import { decode, encode } from "@msgpack/msgpack";

import Event from "rx.mini";
import getPort from "get-port";

export class PeerUdpMock implements Peer {
  type = "udp mock";
  SdpType: "offer" | "answer" | undefined = undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  private host = "127.0.0.1";
  private port?: number;
  private socket = dgram.createSocket("udp4");
  private target = { host: "", port: 0 };

  constructor(public kid: string) {
    this.socket.on("message", message => {
      if (message.toString() === "connect") {
        this.onConnect.execute(null);
        return;
      }

      const obj = this.parseRPC(message);
      if (obj) this.onRpc.execute(obj);
    });
  }

  private async bind() {
    this.port = await getPort();
    this.socket.bind(this.port, this.host);
  }

  parseRPC = (data: ArrayBuffer) => {
    const buffer = Buffer.from(data);
    try {
      const data: RPC = decode(buffer) as any;
      if (data.type) {
        if (data.sdp) data.sdp = JSON.parse(data.sdp as any);
        return data;
      }
    } catch (error) {}
    return undefined;
  };

  rpc = (send: RPCBase & ID & { [key: string]: unknown }) => {
    if (send.sdp) send.sdp = JSON.stringify(send.sdp);
    const packet = encode(send);
    this.socket.send(packet, this.target.port, this.target.host);
  };

  createOffer = async () => {
    this.SdpType = "offer";
    await this.bind();

    return { host: this.host, port: this.port } as any;
  };

  setOffer = async (sdp: any) => {
    this.SdpType = "answer";
    this.target = { port: sdp.port, host: sdp.host };

    await this.bind();

    return this as any;
  };

  setAnswer = async (sdp: any) => {
    this.target = { port: sdp.port, host: sdp.host };
    this.socket.send("connect", this.target.port, this.target.host);
    await new Promise(r => setTimeout(r, 0));
    this.onConnect.execute(null);

    return undefined;
  };

  disconnect = () => {
    this.onDisconnect.execute(null);
  };
}

export const PeerUdpModule = (kid: string) => new PeerUdpMock(kid);
