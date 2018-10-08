import sha1 from "sha1";

export default {
  STORE: "STORE",
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

export function networkFormat(nodeId: string, type: string, data: any) {
  let packet = {
    layer: "networkLayer",
    type: type,
    nodeId: nodeId,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = sha1(JSON.stringify(packet)).toString();
  return JSON.stringify(packet);
}
