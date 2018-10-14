import sha1 from "sha1";
import { networkFormat } from "./KConst";
import def from "./KConst";
import Kademlia from "./kademlia";
import { distance } from "kad-distance";

const responder: any = {};

export default class KResponder {
  constructor(kad: Kademlia) {
    const k = kad;

    responder[def.STORE] = async (network: any) => {
      console.log("on store", network.nodeId);

      const data = network.data;
      //自分と送信元の距離
      const mine = distance(k.nodeId, data.key);
      //自分のkbuckets中で送信元に一番近い距離
      const close = k.f.getCloseEstDist(data.key);
      if (mine > close) {
        console.log("store transfer", "\ndata", data);
        //storeし直す
        k.store(data.sender, data.key, data.value);
      } else {
        console.log("store arrived", mine, close, "\ndata", data);
        //受け取る
        k.keyValueList[sha1(data.value).toString()] = data.value;
        k.callback.onStore(k.keyValueList);
      }

      const target = data.sender;

      if (data.key === k.nodeId && !k.f.isNodeExist(target)) {
        if (data.value.sdp) {
          console.log("is signaling");

          if (data.value.sdp.type === "offer") {
            console.log("kad received offer", data.sender);
            await k
              .answer(target, data.value.sdp, data.value.proxy)
              .catch(console.log);
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

    responder[def.FINDVALUE] = (network: any) => {
      console.log("on findvalue", network.nodeId);
      const data = network.data;
      //ターゲットのキーを持っていたら
      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        const value = k.keyValueList[data.targetKey];
        const peer = k.f.getPeerFromnodeId(network.nodeId);
        //キーを見つかったというメッセージを戻す
        if (!peer) return;
        peer.send(
          networkFormat(k.nodeId, def.FINDVALUE_R, {
            find: true,
            value: value
          }),
          "kad"
        );
      } else {
        //キーに最も近いピア
        const ids = k.f.getCloseEstIdsList;
        const peer = k.f.getPeerFromnodeId(network.nodeId);
        console.log(
          "re send value",
          networkFormat(k.nodeId, def.FINDVALUE_R, {
            find: false,
            ids: ids,
            targetNode: data.targetNode,
            targetKey: data.targetKey,
            to: network.nodeId
          })
        );
        if (peer)
          peer.send(
            networkFormat(k.nodeId, def.FINDVALUE_R, {
              find: false,
              ids: ids,
              targetNode: data.targetNode,
              targetKey: data.targetKey,
              to: network.nodeId
            }),
            "kad"
          );
      }
    };

    responder[def.FINDVALUE_R] = (network: any) => {
      const data = network.data;
      //valueを発見していれば
      if (data.find) {
        console.log("findvalue found");
        k.callback.onFindValue(data.value);
      } else if (data.to === k.nodeId) {
        console.log(def.FINDVALUE_R, "re find", data);
        //発見できていなければ候補に対して再探索
        for (let id in data.ids) {
          const peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.targetKey, peer);
        }
      }
    };

    responder[def.PING] = (network: any) => {
      const data = network.data;
      if (data.target === k.nodeId) {
        console.log("ping received");
        //ノードIDからピアを取得
        const peer = k.f.getPeerFromnodeId(network.nodeId);
        if (!peer) return;
        const sendData = { target: network.nodeId };
        peer.send(networkFormat(k.nodeId, def.PONG, sendData), "kad");
      }
    };

    responder[def.PONG] = (network: any) => {
      const data = network.data;
      if (data.target === k.nodeId) {
        console.log("pong received", network.nodeId);
        //pingのコールバック
        k.callback._onPing[network.nodeId]();
      }
    };

    responder[def.FINDNODE] = (network: any) => {
      console.log("on findnode", network.nodeId);
      const data = network.data;
      //要求されたキーに近い複数のキーを送る
      const sendData = { closeIDs: k.f.getCloseIDs(data.targetKey) };
      const peer = k.f.getPeerFromnodeId(network.nodeId);
      if (peer) {
        console.log("sendback findnode");
        //送り返す
        peer.send(networkFormat(k.nodeId, def.FINDNODE_R, sendData), "kad");
      }
    };

    responder[def.FINDNODE_R] = async (network: any) => {
      const data = network.data;
      //帰ってきた複数のID
      const ids = data.closeIDs;
      console.log("on findnode-r", ids);

      //非同期をまとめてやる
      Promise.all(
        ids.map(async (target: string) => {
          if (target !== k.nodeId && !k.f.isNodeExist(target)) {
            //IDが接続されていないものなら接続する
            await k.offer(target, network.nodeId).catch(console.log);
          }
          //ノードIDが見つかったらコールバック
          if (k.state.findNode === target) {
            k.callback.onFindNode();
          }
        })
      );

      //初期動作のfindnodeでなければ
      if (k.state.findNode !== k.nodeId) {
        console.log("not found");
        //ノードIDが見つからなければ
        if (!ids.includes(k.state.findNode)) {
          //問い合わせ先を除外
          const close = k.f.getCloseEstPeer(k.state.findNode, {
            excludeId: network.nodeId
          });
          if (!close) return;
          console.log("findnode-r keep find node", k.state.findNode);
          //再探索
          k.findNode(k.state.findNode, close);
        }
      }
    };
  }

  response(rpc: string, req: any) {
    console.log("kad rpc", rpc, req);
    if (Object.keys(responder).includes(rpc)) {
      responder[rpc](req);
    }
  }
}
