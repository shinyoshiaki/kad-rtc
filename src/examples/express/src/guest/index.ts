import axios from "axios";
import { Kademlia, PeerModule } from "../../../..";

export default async function guest(kad: Kademlia, target: string) {
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
  if (res) {
    console.log("connected");
  }
}
