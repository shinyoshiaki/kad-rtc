import Express from "express";
import { Kademlia, PeerModule, Peer } from "../../../..";
import bodyParser from "body-parser";

const peers: { [key: string]: Peer } = {};

export default async function potalnode(kad: Kademlia, port: number) {
  const app = Express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.listen(port, () => {
    console.log("Example app listening on port " + port);
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
