import sha1 from "sha1";
import { BSON } from "bson";

export default {
  STORE: "STORE",
  STORE_CHUNKS: "STORE_CHUNKS",
  FINDNODE: "FINDNODE",
  FINDNODE_R: "FINDNODE_R",
  FINDVALUE: "FINDVALUE",
  FINDVALUE_R: "FINDVALUE_R",
  PING: "PING",
  PONG: "PONG",
  ONCOMMAND: "ONCOMMAND",
  ADD_KNODE: "ADD_KNODE",
  DISCONNECT_KNODE: "DISCONNECT_KNODE",
  BROADCAST: "BROADCAST",
  SEND: "SEND"
};

export function networkFormat(nodeId: string, type: string, data: any): Buffer {
  let packet = {
    layer: "networkLayer",
    type: type,
    nodeId: nodeId,
    data: data,
    date: Date.now().toString(),
    hash: ""
  };
  packet.hash = sha1(JSON.stringify(packet)).toString();
  const bson = new BSON();

  return bson.serialize(packet);
}
