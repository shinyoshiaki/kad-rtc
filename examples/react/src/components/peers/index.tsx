import React, { FC, useState, useEffect } from "react";
import { kad } from "../../services/kademlia";
import { Content } from "../atoms/styled";

const Peers: FC = () => {
  const [allPeers, setallPeers] = useState<string[][]>([]);

  useEffect(() => {
    setInterval(() => {
      const tree = kad.di.kTable.kbuckets.map(v =>
        v.peers.map(peer => peer.kid)
      );
      setallPeers(tree);
    }, 1000);
  }, []);

  return (
    <Content>
      <p>peers</p>
      {allPeers.map(
        (peers, i) =>
          peers.length > 0 && (
            <div
              key={i}
              style={{ border: "solid 1px", padding: 5 }}
            >{`${i}  ${peers.join(" , ")}`}</div>
          )
      )}
    </Content>
  );
};

export default Peers;
