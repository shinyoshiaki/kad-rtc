import Peer from "../../implements/peer";

const FindNode = (payload: string) => {
  return { rpc: "findnode" as const, payload };
};

export type FindNode = ReturnType<typeof FindNode>;

const Connect = (payload: string) => {
  return { rpc: "connect" as const, payload };
};

export type Connect = ReturnType<typeof Connect>;

export default async function findNode(kid: string, peers: Peer[]) {
  for (let peer of peers) {
    peer.send(JSON.stringify(FindNode(kid)));

    const ask = await peer.onData.asPromise().catch();
    if (!ask) continue;
    const offer = JSON.parse(ask);
    peer.setOffer(offer);

    const sdp = await peer.signal.asPromise();
    peer.send(JSON.stringify(Connect(sdp)));
  }
}
