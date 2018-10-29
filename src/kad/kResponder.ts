import { networkFormat } from "./KConst";
import def from "./KConst";
import Kademlia, { excuteEvent } from "./kademlia";
import { distance } from "kad-distance";
import { BSON } from "bson";

const bson = new BSON();
const responder: any = {};

export default class KResponder {
  offerQueue: Array<any> = [];
  storeChunks: { [key: string]: any[] } = {};
  constructor(kad: Kademlia) {
    const k = kad;
    this.playOfferQueue();

    responder[def.STORE] = async (network: any) => {
      console.log("on store", network.nodeId);

      const data: StoreFormat = network.data;
      //自分と送信元の距離
      const mine = distance(k.nodeId, data.key);
      //自分のkbuckets中で送信元に一番近い距離
      const close = k.f.getCloseEstDist(data.key);
      if (mine > close) {
        console.log("store transfer", "\ndata", data);
        //storeし直す
        k.store(data.sender, data.key, data.value);
        //レプリケーション
        k.keyValueList[data.key] = data.value;
      } else {
        console.log("store arrived", mine, close, "\ndata", data);
        //受け取る
        k.keyValueList[data.key] = data.value;
        excuteEvent(kad.onStore, data.value);
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
              console.log(k.ref[target]);
              k.ref[target].setAnswer(data.value.sdp);
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    };

    responder[def.STORE_CHUNKS] = (network: any) => {
      const data: StoreChunks = network.data;
      if (data.index === 0) {
        this.storeChunks[data.key] = [];
      }
      this.storeChunks[data.key].push(data.value);
      if (data.index === data.size - 1) {
        k.keyValueList[data.key] = { chunks: this.storeChunks[data.key] };
        const mine = distance(k.nodeId, data.key);
        const close = k.f.getCloseEstDist(data.key);
        if (mine > close) {
          console.log("store transfer", "\ndata", data);
          k.storeChunks(data.sender, data.key, this.storeChunks[data.key]);
        } else {
          console.log("store arrived", mine, close, "\ndata", data);
          excuteEvent(kad.onStore, data.value);
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
        let sendData: FindValueR;
        if (value.chunks) {
          const chunks: any[] = value.chunks;
          chunks.forEach((chunk, i) => {
            sendData = {
              chunks: {
                value: chunk,
                key: data.targetKey,
                index: i,
                size: chunks.length
              }
            };
            peer.send(
              networkFormat(k.nodeId, def.FINDVALUE_R, sendData),
              "kad"
            );
          });
        } else {
          sendData = {
            success: { value, key: data.targetKey }
          };
          peer.send(networkFormat(k.nodeId, def.FINDVALUE_R, sendData), "kad");
        }
      } else {
        //キーに最も近いピア
        const ids = k.f.getCloseEstIdsList(data.targetKey);
        const peer = k.f.getPeerFromnodeId(network.nodeId);
        console.log("re send value");
        if (peer) {
          const sendData: FindValueR = {
            fail: {
              ids: ids,
              targetNode: data.targetNode,
              targetKey: data.targetKey,
              to: network.nodeId
            }
          };
          peer.send(networkFormat(k.nodeId, def.FINDVALUE_R, sendData), "kad");
        }
      }
    };

    responder[def.FINDVALUE_R] = (network: any) => {
      const data: FindValueR = network.data;
      //valueを発見していれば
      if (data.success) {
        //通常ファイル
        console.log("findvalue found");
        k.callback._onFindValue(data.success.value);
        k.keyValueList[data.success.key] = data.success.value;
      } else if (data.chunks) {
        //ラージファイル
        if (data.chunks.index === 0) {
          this.storeChunks[data.chunks.key] = [];
        }
        this.storeChunks[data.chunks.key].push(data.chunks.value);
        if (data.chunks.index === data.chunks.size - 1) {
          k.keyValueList[data.chunks.key] = {
            chunks: this.storeChunks[data.chunks.key]
          };
          k.callback._onFindValue(this.storeChunks[data.chunks.key]);
        }
      } else if (data.fail && data.fail.to === k.nodeId) {
        console.log(def.FINDVALUE_R, "re find", data);
        //発見できていなければ候補に対して再探索
        for (let id in data.fail.ids) {
          const peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.fail.targetKey, peer);
        }
      }
    };

    responder[def.FINDNODE] = (network: any) => {
      console.log("on findnode", network.nodeId);
      const data = network.data;
      //要求されたキーに近い複数のキーを送る
      const sendData = { closeIDs: k.f.getCloseIDs(data.targetKey) };

      console.log(network.nodeId, {
        allpeer: k.f.getAllPeerIds(),
        ids: sendData.closeIDs
      });

      const peer = k.f.getPeerFromnodeId(network.nodeId);
      if (peer) {
        console.log("sendback findnode", sendData.closeIDs);
        //送り返す
        peer.send(networkFormat(k.nodeId, def.FINDNODE_R, sendData), "kad");
      }
    };

    responder[def.FINDNODE_R] = async (network: any) => {
      const data = network.data;
      //帰ってきた複数のID
      const ids = data.closeIDs;
      console.log("on findnode-r", ids);

      for (let key in ids) {
        const target = ids[key];
        this.offerQueue.push(async () => {
          console.log("offerque run", target);
          if (target !== k.nodeId && !k.f.isNodeExist(target)) {
            //IDが接続されていないものなら接続する
            await k.offer(target, network.nodeId).catch(console.log);
          }
        });
        //ノードIDが見つかったらコールバック
        if (k.state.findNode === target) {
          k.callback._onFindNode(target);
        }
      }

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

  async playOfferQueue() {
    while (true) {
      if (this.offerQueue.length > 0) {
        const job = this.offerQueue[0];
        console.log("do job", { job }, this.offerQueue);
        await job();
        this.offerQueue.shift();
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  response(rpc: string, req: any) {
    console.log("kad rpc", rpc, req);
    if (Object.keys(responder).includes(rpc)) {
      responder[rpc](req);
    }
  }
}
