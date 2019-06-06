import axios from "axios";
import {
  Kademlia,
  PeerModule,
  genKid,
  KvsModule,
  updateTimeout
} from "../../../../../src";

updateTimeout(2 * 3000);

const kad: Kademlia = new Kademlia(
  genKid(),
  {
    peerCreate: PeerModule,
    kvs: KvsModule
  },
  { kBucketSize: 4 }
);

export { kad };

export default async function guest(target: string) {
  const join = await axios.post(target + "/join", {
    kid: kad.kid
  });
  console.log({ join });
  const { kid, offer } = join.data;
  const peer = PeerModule(kid);
  const answer = await peer.setOffer(offer);
  const res = await axios.post(target + "/answer", {
    kid: kad.kid,
    answer
  });
  kad.add(peer);
  if (res) {
    console.log("connected");
  }
}
