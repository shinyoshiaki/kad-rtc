import Kademlia from "../kad/kademlia";
import WebRTC from "webrtc4me";
import { BSON } from "bson";
import { message } from "webrtc4me/lib/interface";
import { excuteEvent, IEvents } from "../util";
import { p2pMessage, p2pMessageEvent } from "../kad/interface";

const bson = new BSON();

export default class P2P {
  kad: Kademlia;
  private p2pMsgBuffer: { [key: string]: any[] } = {};
  private onP2P: IEvents = {};
  events = {
    p2p: this.onP2P
  };
  constructor(kad: Kademlia) {
    this.kad = kad;
    this.kad.events.responder["p2p.ts"] = (message: message) => {
      this.responder(message);
    };
  }

  async send(
    target: string,
    data: { text?: string; file?: { name: string; value: ArrayBuffer[] } }
  ) {
    const send = async (peer: WebRTC) => {
      const packet: p2pMessage = {
        sender: this.kad.nodeId,
        target
      };
      if (data.text) {
        packet.text = data.text;
        const bin = bson.serialize(packet);
        peer.send(bin, "p2p");
      } else if (data.file) {
        const file = data.file;

        for (let i = 0; i < file.value.length; i++) {
          const chunk = file.value[i];
          packet.file = {
            index: i,
            length: file.value.length,
            chunk: Buffer.from(chunk),
            filename: file.name
          };
          const bin = bson.serialize(packet);
          peer.send(bin, "p2p");
          await new Promise(r => setTimeout(r, 10));
        }
      }
    };

    return new Promise<any>(async (resolve, reject) => {
      const peer = this.kad.f.getPeerFromnodeId(target);
      if (peer) {
        await send(peer);
        resolve(true);
      } else {
        const close = this.kad.f.getCloseEstPeer(target);
        if (!close) return;
        const result = await this.kad
          .findNode(target, close)
          .catch(console.log);
        if (!result) return;
        await send(result);
        resolve(true);
      }
      await new Promise(r => setTimeout(r, 10 * 1000));
      reject("send timeout");
    });
  }

  private responder(message: message) {
    if (message.label === "p2p") {
      const buffer: Buffer = Buffer.from(message.data);
      const packet: p2pMessage = bson.deserialize(buffer);
      if (packet.text) {
        const payload: p2pMessageEvent = {
          nodeId: packet.sender,
          text: packet.text
        };
        excuteEvent(this.events.p2p, payload);
      } else if (packet.file) {
        if (packet.file.index === 0) this.p2pMsgBuffer[packet.sender] = [];
        this.p2pMsgBuffer[packet.sender].push(packet.file.chunk.buffer);
        if (packet.file.index === packet.file.length - 1) {
          const payload: p2pMessageEvent = {
            nodeId: packet.sender,
            file: this.p2pMsgBuffer[packet.sender],
            filename: packet.file.filename
          };
          excuteEvent(this.events.p2p, payload);
        }
      }
    }
  }
}
