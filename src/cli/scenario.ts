import WebRTC from "simple-datachannel/lib/NodeRTC";
import Kademlia from "../kad/kademlia";
import sha1 from "sha1";

const sleep = (waitSeconds: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, waitSeconds * 1000);
  });
};

const portalNodeId = sha1("portalnode").toString();
const portalNodeKad = new Kademlia(portalNodeId);

function portalNodeAnswer(
  sdp: any,
  nodeId: string,
  callback: (local: any) => void
) {
  const PortalNode = new WebRTC();
  PortalNode.connecting(nodeId);
  PortalNode.connect = () => {
    console.log("portalnode connected", portalNodeId, nodeId);
    portalNodeKad.addknode(PortalNode);
  };
  PortalNode.makeAnswer(sdp, { disable_stun: true });
  PortalNode.signal = local => {
    callback(local);
  };
}

function connectNode(nodeId: string) {
  return new Promise<WebRTC>(resolve => {
    const Node = new WebRTC();
    Node.connecting(portalNodeId);
    Node.makeOffer({ disable_stun: true });
    Node.signal = local => {
      portalNodeAnswer(local, nodeId, sdp => {
        Node.setAnswer(sdp);
      });
    };
    Node.connect = () => {
      resolve(Node);
    };
  });
}

const Kads: Array<Kademlia> = [];

(async () => {
  for (let i = 0; i < 10; i++) {
    const nodeId = sha1(Math.random().toString()).toString();
    const node = await connectNode(nodeId);
    const kad = new Kademlia(nodeId);
    Kads.push(kad);
    kad.addknode(node);
    await sleep(1);
  }
})();
