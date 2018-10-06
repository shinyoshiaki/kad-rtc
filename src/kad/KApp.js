import { networkFormat } from "./Kademlia";
import Kademlia from "./Kademlia";
import sha1 from "sha1";
import def from "./KConst";

let k;
// let k = new Kademlia();

export default class KApp {
  constructor(kademlia) {
    k = kademlia;
    this.kad = k;

    k.kresponder.responder[def.BROADCAST] = network => {
      const str = JSON.stringify(network);
      k.f.getAllPeers().forEach(v => {
        const result = k.ping(v);
        if (result) {
          k.findNode(k.nodeId, v);
          v.send(str, "kad");
          console.log("broadcast done");
        } else {
          console.log("broadcast faile");
        }
      });
    };

    k.ev.on("onStore", value => {
      if (value.type === "storeFile") {
        console.log("on file store");
        k.findValue(value.nodeId, value.dataHash);
      }
    });
  }

  storeFileInfo(arr, target) {
    console.log("store file", arr, target);
    const hash = sha1(arr);
    k.keyValueList[hash] = arr;
    k.store(k.nodeId, target, {
      type: "storeFile",
      nodeId: k.nodeId,
      dataHash: hash
    });
  }

  broadcast(data) {
    k.f.getAllPeers().forEach(v => {
      const result = k.ping(v);
      if (result) {
        k.findNode(k.nodeId, v);
        v.send(networkFormat(k.nodeId, def.BROADCAST, data), "kad");
        console.log("broadcast done");
      } else {
        console.log("broadcast faile");
      }
    });
  }
}
