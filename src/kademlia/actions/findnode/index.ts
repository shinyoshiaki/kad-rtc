import Peer from "../../modules/peer";

const FindNode = (kid: string) => {
  return { rpc: "findnode" as const, kid };
};

export type FindNode = ReturnType<typeof FindNode>;

const Connect = (payload: string) => {
  return { rpc: "connect" as const, payload };
};

export type Connect = ReturnType<typeof Connect>;

export default async function findNode(kid: string, peers: Peer[]) {
  const finds: Peer[] = [];
  for (let peer of peers) {
    peer.send(JSON.stringify(FindNode(kid)));

    const ask = await peer.onData.asPromise().catch();
    if (!ask) continue;
    const offer = JSON.parse(ask);

    const open = await peer.open(offer);
    finds.push(open);
  }
  return finds;
}
