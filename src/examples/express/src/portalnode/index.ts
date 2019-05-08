import Express from "express";
import { Kademlia, KvsModule, PeerModule, Peer, genKid } from "../../../../";
import bodyParser from "body-parser";
import axios from "axios";

const kad = new Kademlia(genKid(), { kvs: KvsModule, peerCreate: PeerModule });
const peers: { [key: string]: Peer } = {};

export default async function potalnode(port: number, taget?: string) {
  asHost(port);
  if (taget) {
    console.log("target");

    const join = await axios.post(taget + "/join", {
      kid: kad.kid
    });
    console.log({ join });
    const { kid, offer } = join.data;
    const peer = PeerModule(kid);
    const answer = await peer.setOffer(offer);
    const res = await axios.post(taget + "/answer", {
      kid: kad.kid,
      answer
    });
    if (res) {
      console.log("connected");
    }
  }
}

async function asHost(port: number) {
  const app = Express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.listen(port, () => {
    console.log("Example app listening on port " + port);
  });

  app.get("/", (req: Express.Request, res: Express.Response) => {
    return res.send("Hello world.");
  });

  app.post("/join", async (req: Express.Request, res: Express.Response) => {
    try {
      console.log("join", req.body);
      const kid = req.body.kid;
      if (kid) {
        console.log({ kid });
        const peer = PeerModule(kid);
        peers[kid] = peer;
        const offer = await peer.createOffer();
        return res.send({ offer, kid: kad.kid });
      }
    } catch (error) {}
  });

  app.post("/answer", async (req: Express.Request, res: Express.Response) => {
    try {
      const { answer, kid } = req.body;
      if (answer && kid) {
        const peer = peers[kid];
        await peer.setAnswer(answer);
        kad.add(peer);
        delete peers[kid];
        console.log("connected");
        return res.send("connected");
      }
    } catch (error) {}
  });
}
