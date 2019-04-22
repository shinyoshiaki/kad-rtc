import Peer from "../../modules/peer";
import { FindNode } from "../../actions/findnode";
import Ktable from "../../ktable";

const OnFindNode = (peers: string[]) => {
  return { rpc: "onfindnode" as const, peers };
};

export type OnFindNode = ReturnType<typeof OnFindNode>;

const OpenNode = () => {
  return { rpc: "onopennode" as const };
};

export type OpenNode = ReturnType<typeof OpenNode>;

type actions = FindNode | OpenNode;

export default async function onFindNode(reg: Peer, ktable: Ktable) {
  const ondata = reg.onData.subscribe(async raw => {
    try {
      const data: actions = JSON.parse(raw);
      switch (data.rpc) {
        case "findnode":
          {
            const peers = ktable.findNode(data.kid);
            for (let peer of peers) {
              const send = OpenNode();
              peer.rpc(send, send.rpc);
              const res = await peer.onData.asPromise();
            }
          }
          break;
      }
    } catch (error) {}
  });

  reg.onDisconnect.once(() => ondata.unSubscribe());
}
