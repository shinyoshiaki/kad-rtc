import Peer from "../../modules/peer";
import { FindNode, FindNodeAnswer } from ".";
import Ktable from "../../ktable";

const OnFindNode = (peers: { kid: string; sdp: any }[]) => {
  return { rpc: "onfindnode" as const, peers };
};

export type OnFindNode = ReturnType<typeof OnFindNode>;

const OnFindNodeOpen = (kid: string) => {
  return { rpc: "onfindnodeopen" as const, kid };
};

export type OnFindNodeOpen = ReturnType<typeof OnFindNodeOpen>;

const OnFindNodeOpenOffer = (sdp: any, kid: string) => {
  return { rpc: "onfindnodeopenoffer" as const, sdp, kid };
};

type OnFindNodeOpenOffer = ReturnType<typeof OnFindNodeOpenOffer>;

const OnFindNodeOpenAnswer = (sdp: any, kid: string) => {
  return { rpc: "onfindnodeopenanswer" as const, sdp, kid };
};

type OnFindNodeOpenAnswer = ReturnType<typeof OnFindNodeOpenOffer>;

type actions =
  | FindNode
  | FindNodeAnswer
  | OnFindNodeOpen
  | OnFindNodeOpenOffer
  | OnFindNodeOpenAnswer;

export default async function onFindNode(guest: Peer, ktable: Ktable) {
  const ondata = guest.onRpc.subscribe(async (data: actions) => {
    switch (data.rpc) {
      case "findnode":
        {
          const peers = ktable.findNode(data.kid);
          const offers: { kid: string; sdp: any }[] = [];
          for (let peer of peers) {
            const rpc = peer.rpc(OnFindNodeOpen(guest.kid));
            const res: actions = await rpc.asPromise();
            if (res.rpc === "onfindnodeopenoffer") {
              const { kid, sdp } = res;
              offers.push({ kid, sdp });
            }
          }
          guest.rpc(OnFindNode(offers));
        }
        break;
      case "onfindnodeopen":
        {
          const peer = new Peer(data.kid);
          const offer = peer.createOffer();
          guest.rpc(OnFindNodeOpenOffer(offer, ktable.kid));
          const connected = guest.onRpc.subscribe((answer: actions) => {
            if (answer.rpc === "findnodeanswer") {
              const { sdp } = answer;
              peer.setSdp(sdp);
            }
          });
          peer.onConnect.once(() => connected.unSubscribe());
        }
        break;
      case "findnodeanswer":
        {
          const { kid, sdp } = data;

        }
        break;
    }
  });

  guest.onDisconnect.once(() => ondata.unSubscribe());
}
