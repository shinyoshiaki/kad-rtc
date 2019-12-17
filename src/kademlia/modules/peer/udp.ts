import * as dgram from "dgram";

import { Peer, RPC } from "./base";
import { decode, encode } from "@msgpack/msgpack";

import Event from "rx.mini";
import getPort from "get-port";

let port = 0,
  socket: dgram.Socket = null as any;

// 1 worker につき1ソケットを割り当てる
export async function setUpSocket() {
  socket = dgram.createSocket("udp4");
  port = await getPort();
  socket.bind(port, "127.0.0.1");
  socket.setMaxListeners(100000);
  await new Promise(r => socket.once("listening", r));
}

export async function closeUdpSocket() {
  socket.close();
  await new Promise(r => socket.once("close", r));
  socket = null as any;
}

export class PeerUdpMock implements Peer {
  type = "udp mock";
  SdpType: "offer" | "answer" | undefined = undefined;

  onRpc = new Event<any>();
  onDisconnect = new Event();
  onConnect = new Event();

  uuid = Math.random().toString() + Date.now();
  target = { uuid: "", port: 0 };

  constructor(public kid: string) {
    socket.on("message", message => {
      if (message.toString() === "connect," + this.uuid) {
        socket.send(
          "connect," + this.target.uuid,
          this.target.port,
          "127.0.0.1"
        );
        this.onConnect.execute(null);
        return;
      }

      const obj = this.parseRPC(message);
      if (obj && (obj as any).uuid === this.uuid) this.onRpc.execute(obj);
    });
  }

  parseRPC = (data: ArrayBuffer) => {
    const buffer = Buffer.from(data);
    try {
      const data: RPC = decode(buffer) as any;
      if (data.type) {
        return data;
      }
    } catch (error) {}
    return undefined;
  };

  rpc = (send: RPC) => {
    (send as any).uuid = this.target.uuid;
    const packet = encode(send);
    socket.send(packet, this.target.port, "127.0.0.1");
  };

  createOffer = async () => {
    this.SdpType = "offer";
    return { uuid: this.uuid, port } as any;
  };

  setOffer = async (sdp: any) => {
    this.SdpType = "answer";
    this.target.uuid = sdp.uuid;
    this.target.port = sdp.port;
    return { uuid: this.uuid, port } as any;
  };

  setAnswer = async (sdp: any) => {
    this.target.uuid = sdp.uuid;
    this.target.port = sdp.port;
    socket.send("connect," + this.target.uuid, this.target.port, "127.0.0.1");
    await this.onConnect.asPromise();

    return undefined;
  };

  disconnect = () => {
    this.onDisconnect.execute(null);
  };
}

export const PeerUdpModule = (kid: string) => new PeerUdpMock(kid);
