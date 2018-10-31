import WebRTC from "webrtc4me";
import Kademlia from "../kad/kademlia";

const sleep = (waitSeconds: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, waitSeconds * 1000);
  });
};

const portalNodeKad = new Kademlia();

function portalNodeAnswer(
  sdp: any,
  nodeId: string,
  callback: (local: any) => void
) {
  const PortalNode = new WebRTC();
  PortalNode.connect = () => {
    console.log("portalnode connected", portalNodeKad.nodeId, nodeId);
    portalNodeKad.addknode(PortalNode);
  };
  PortalNode.makeAnswer(sdp, { disable_stun: true, nodeId: nodeId });
  PortalNode.signal = local => {
    callback(local);
  };
}

function connectNode(nodeId: string) {
  return new Promise<WebRTC>(resolve => {
    const Node = new WebRTC();
    Node.makeOffer({ disable_stun: true, nodeId: portalNodeKad.nodeId });
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
    const kad = new Kademlia();
    const node = await connectNode(kad.nodeId);
    Kads.push(kad);
    kad.addknode(node);
    await sleep(1);
  }
})();
