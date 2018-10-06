import sha1 from "sha1";
import { networkFormat } from "./Kademlia";
import Kademlia from "./Kademlia";
import def from "./KConst";

let k;
// let k = new Kademlia(null);

const responder = {};

export default class KResponder {
  constructor(kad) {
    k = kad;
    this.responder = responder;
  }

  response(rpc, req) {
    console.log("kad rpc", rpc, req);
    if (Object.keys(responder).includes(rpc)) {
      this.responder[rpc](req);
    }
  }
}

responder[def.STORE] = network => {
  console.log("on store", network.nodeId);

  const data = network.data;

  const mine = k.f.distance(k.nodeId, data.key);
  const close = k.f.getCloseEstDist(data.key);
  if (mine > close) {
    console.log("store transfer", "\ndata", data);
    k.store(data.sender, data.key, data.value);
  } else {
    console.log("store arrived", mine, close, "\ndata", data);
    k.ev.emit("onStore", data.value);
  }

  const target = data.sender;

  if (data.key === k.nodeId && !k.f.isNodeExist(target)) {
    if (data.value.sdp) {
      console.log("is signaling");
      if (data.value.sdp.type === "offer") {
        console.log("kad received offer", data.sender);

        k.answer(target, data.value.sdp, data.value.proxy).then(
          peer => k.addknode(peer),
          err => console.log("findnode answer fail", target, err)
        );
      } else if (data.value.sdp.type === "answer") {
        console.log("kad received answer", data.sender);
        try {
          k.ref[target].setAnswer(data.value.sdp);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};

responder[def.FINDNODE] = network => {
  console.log("on findnode", network.nodeId);
  const data = network.data;
  const sendData = { closeIDs: k.f.getCloseIDs(data.targetKey) };
  if (k.f.getPeerFromnodeId(network.nodeId) != null) {
    k.f
      .getPeerFromnodeId(network.nodeId)
      .send(networkFormat(k.nodeId, def.FINDNODE_R, sendData), "kad");
  }
};

responder[def.FINDNODE_R] = async network => {
  const data = network.data;
  const ids = data.closeIDs;
  console.log("on findnode-r", ids);

  Promise.all(
    ids.map(async target => {
      if (target !== k.nodeId && !k.f.isNodeExist(target)) {
        if (!k.failPeerList[target] || k.failPeerList[target] < 3) {
          await k
            .offer(target, network.nodeId)
            .then(
              peer => k.addknode(peer),
              err => console.log("kad offer fail", err)
            );
        } else {
          console.log("fail too much kad offer", target);
        }
      }
      if (k.state.findNode !== k.nodeId) {
        if (!ids.includes(k.state.findNode)) {
          const close = k.f.getCloseEstPeer(k.state.findNode, {
            excludeId: network.nodeId
          });
          console.log("findnode-r keep find node", k.state.findNode);
          k.findNode(k.state.findNode, close);
        }
      }
    })
  );
};

responder[def.FINDVALUE] = network => {
  console.log("on findvalue", network.nodeId);
  const data = network.data;

  if (
    k.nodeId === data.targetNode &&
    Object.keys(k.keyValueList).includes(data.targetKey)
  ) {
    const arr = k.keyValueList[data.targetKey];
    const peer = k.f.getPeerFromnodeId(network.nodeId);
    peer.send(JSON.stringify({ type: "start", data: sha1(arr) }), "data");
    arr.forEach(ab => {
      peer.send(ab, "data");
    });
    peer.send(JSON.stringify({ type: "end" }), "data");
  } else {
    const ids = k.f.getCloseEstIdsList;
    k.f.getPeerFromnodeId(network.nodeId).send(
      networkFormat(k.nodeId, def.FINDVALUE_R, {
        ids: ids,
        targetNode: data.targetNode,
        targetKey: data.targetKey,
        to: network.nodeId
      }),
      "kad"
    );
  }
};

responder[def.FINDVALUE_R] = network => {
  const data = network.data;
  if (data.to === k.nodeId) {
    console.log(def.FINDVALUE_R, "re find");

    (async () => {
      for (let id in data.ids) {
        await k.offer(id, network.nodeId).then(
          peer => {
            k.addknode(peer);
            k.doFindvalue(data.key);
          },
          err => console.log("kad offer fail", err)
        );
      }
    })();
  }
};

responder[def.PING] = network => {
  const data = network.data;

  if (data.target === k.nodeId) {
    console.log("ping received");
    k.f.getAllPeers().forEach(v => {
      if (v.nodeId === network.nodeId) {
        const sendData = { target: network.nodeId };
        v.send(networkFormat(k.nodeId, def.PONG, sendData), "kad");
      }
    });
  }
};

responder[def.PONG] = network => {
  const data = network.data;

  if (data.target === k.nodeId) {
    console.log("pong received", network.nodeId);
    k.pingResult[network.nodeId] = true;
  }
};
