import WebRTC from "webrtc4me";
import Kademlia from "../../kad/kademlia";

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
  const PortalNode = new WebRTC({ disable_stun: true, nodeId });
  PortalNode.connect = async () => {
    portalNodeKad.addknode(PortalNode);
  };
  PortalNode.setSdp(sdp);
  PortalNode.signal = local => {
    callback(local);
  };
}

function connectNode(nodeId: string) {
  return new Promise<WebRTC>(resolve => {
    const Node = new WebRTC({
      disable_stun: true,
      nodeId: portalNodeKad.nodeId
    });
    Node.makeOffer();
    Node.signal = local => {
      portalNodeAnswer(local, nodeId, sdp => {
        Node.setSdp(sdp);
      });
    };
    Node.connect = () => {
      resolve(Node);
    };
  });
}

const Kads: Array<Kademlia> = [];

test(
  "findnode",
  async done => {
    for (let i = 0; i < 4; i++) {
      const kad = new Kademlia();
      const node = await connectNode(kad.nodeId);
      Kads.push(kad);
      kad.addknode(node);
    }
    const num = Kads[Kads.length - 1].f.getAllPeerIds().length;
    console.log({ num });
    expect(num).toBe(3);
    done();
  },
  30 * 1000
);
