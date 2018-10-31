"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kademlia = require("./kademlia");

var _kadDistance = require("kad-distance");

var _bson = require("bson");

var _bufferToArraybuffer = _interopRequireDefault(require("buffer-to-arraybuffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bson = new _bson.BSON();
var responder = {};

var KResponder =
/*#__PURE__*/
function () {
  function KResponder(kad) {
    var _this = this;

    _classCallCheck(this, KResponder);

    _defineProperty(this, "offerQueue", []);

    _defineProperty(this, "storeChunks", {});

    var k = kad;
    this.playOfferQueue();

    responder[_KConst.default.STORE] =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(network) {
        var data, mine, close, target, isSdp;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("on store", network.nodeId);
                data = network.data; //自分と送信元の距離

                mine = (0, _kadDistance.distance)(k.nodeId, data.key); //自分のkbuckets中で送信元に一番近い距離

                close = k.f.getCloseEstDist(data.key);

                if (mine > close) {
                  console.log("store transfer", "\ndata", data); //storeし直す

                  k.store(data.sender, data.key, data.value);
                } else {
                  console.log("store arrived", mine, close, "\ndata", data);
                }

                target = data.sender;
                isSdp = false;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 18;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 18;
                  break;
                }

                console.log("is signaling");
                isSdp = true;

                if (!(data.value.sdp.type === "offer")) {
                  _context.next = 17;
                  break;
                }

                console.log("kad received offer", data.sender);
                _context.next = 15;
                return k.answer(target, data.value.sdp, data.value.proxy).catch(console.log);

              case 15:
                _context.next = 18;
                break;

              case 17:
                if (data.value.sdp.type === "answer") {
                  console.log("kad received answer", data.sender);

                  try {
                    console.log(k.ref[target]);
                    k.ref[target].setAnswer(data.value.sdp);
                  } catch (error) {
                    console.log(error);
                  }
                }

              case 18:
                //レプリケーション
                if (!isSdp) {
                  // //キーが衝突しない前提
                  // if (!k.keyValueList[data.key])
                  (0, _kademlia.excuteEvent)(kad.onStore, data.value);
                  k.keyValueList[data.key] = data.value;
                }

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    responder[_KConst.default.STORE_CHUNKS] = function (network) {
      var data = network.data;

      if (data.index === 0) {
        _this.storeChunks[data.key] = [];
      }

      console.log("storechunks buffer2ab", (0, _bufferToArraybuffer.default)(data.value));

      _this.storeChunks[data.key].push((0, _bufferToArraybuffer.default)(data.value).buffer);

      if (data.index === data.size - 1) {
        //レプリケーション
        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        (0, _kademlia.excuteEvent)(kad.onStore, data.value);
        var mine = (0, _kadDistance.distance)(k.nodeId, data.key);
        var close = k.f.getCloseEstDist(data.key);

        if (mine > close) {
          console.log("store transfer", "\ndata", data, _this.storeChunks[data.key]);
          k.storeChunks(data.sender, data.key, _this.storeChunks[data.key]);
        } else {
          console.log("store arrived", mine, close, "\ndata", data, _this.storeChunks[data.key]);
        }
      }
    };

    responder[_KConst.default.FINDVALUE] = function (network) {
      console.log("on findvalue", network.nodeId);
      var data = network.data; //ターゲットのキーを持っていたら

      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        var value = k.keyValueList[data.targetKey];
        var peer = k.f.getPeerFromnodeId(network.nodeId); //キーを見つかったというメッセージを戻す

        if (!peer) return;
        var sendData;

        if (value.chunks) {
          //ラージファイル
          console.log("on findvalue send chunks");
          var chunks = value.chunks;
          chunks.forEach(function (chunk, i) {
            sendData = {
              chunks: {
                value: Buffer.from(chunk),
                key: data.targetKey,
                index: i,
                size: chunks.length
              }
            };
            peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
          });
        } else {
          //スモールファイル
          sendData = {
            success: {
              value: value,
              key: data.targetKey
            }
          };
          peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
        }
      } else {
        //キーに最も近いピア
        var ids = k.f.getCloseEstIdsList(data.targetKey);

        var _peer = k.f.getPeerFromnodeId(network.nodeId);

        console.log("re send value");

        if (_peer) {
          var _sendData = {
            fail: {
              ids: ids,
              targetNode: data.targetNode,
              targetKey: data.targetKey,
              to: network.nodeId
            }
          };

          _peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, _sendData), "kad");
        }
      }
    };

    responder[_KConst.default.FINDVALUE_R] = function (network) {
      var data = network.data; //valueを発見していれば

      if (data.success) {
        //通常ファイル
        console.log("findvalue found");

        k.callback._onFindValue(data.success.value);

        k.keyValueList[data.success.key] = data.success.value;
      } else if (data.chunks) {
        //ラージファイル
        if (data.chunks.index === 0) {
          _this.storeChunks[data.chunks.key] = [];
        }

        console.log("findvalue r chunks bf2ab", (0, _bufferToArraybuffer.default)(data.chunks.value));

        _this.storeChunks[data.chunks.key].push((0, _bufferToArraybuffer.default)(data.chunks.value).buffer);

        if (data.chunks.index === data.chunks.size - 1) {
          console.log("findvalue r");
          k.keyValueList[data.chunks.key] = {
            chunks: _this.storeChunks[data.chunks.key]
          };

          k.callback._onFindValue({
            chunks: _this.storeChunks[data.chunks.key]
          });
        }
      } else if (data.fail && data.fail.to === k.nodeId) {
        console.log(_KConst.default.FINDVALUE_R, "re find", data); //発見できていなければ候補に対して再探索

        for (var id in data.fail.ids) {
          var peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.fail.targetKey, peer);
        }
      }
    };

    responder[_KConst.default.FINDNODE] = function (network) {
      console.log("on findnode", network.nodeId);
      var data = network.data; //要求されたキーに近い複数のキーを送る

      var sendData = {
        closeIDs: k.f.getCloseIDs(data.targetKey)
      };
      console.log(network.nodeId, {
        allpeer: k.f.getAllPeerIds(),
        ids: sendData.closeIDs
      });
      var peer = k.f.getPeerFromnodeId(network.nodeId);

      if (peer) {
        console.log("sendback findnode", sendData.closeIDs); //送り返す

        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDNODE_R, sendData), "kad");
      }
    };

    responder[_KConst.default.FINDNODE_R] =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(network) {
        var data, ids, _loop, _key, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);

                _loop = function _loop(_key) {
                  var target = ids[_key];

                  _this.offerQueue.push(
                  /*#__PURE__*/
                  _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2() {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            console.log("offerque run", target);

                            if (!(target !== k.nodeId && !k.f.isNodeExist(target))) {
                              _context2.next = 4;
                              break;
                            }

                            _context2.next = 4;
                            return k.offer(target, network.nodeId).catch(console.log);

                          case 4:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }))); //ノードIDが見つかったらコールバック


                  if (k.state.findNode === target) {
                    k.callback._onFindNode(target);
                  }
                };

                for (_key in ids) {
                  _loop(_key);
                } //初期動作のfindnodeでなければ


                if (!(k.state.findNode !== k.nodeId)) {
                  _context3.next = 13;
                  break;
                }

                console.log("not found"); //ノードIDが見つからなければ

                if (ids.includes(k.state.findNode)) {
                  _context3.next = 13;
                  break;
                }

                //問い合わせ先を除外
                close = k.f.getCloseEstPeer(k.state.findNode, {
                  excludeId: network.nodeId
                });

                if (close) {
                  _context3.next = 11;
                  break;
                }

                return _context3.abrupt("return");

              case 11:
                console.log("findnode-r keep find node", k.state.findNode); //再探索

                k.findNode(k.state.findNode, close);

              case 13:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }();
  }

  _createClass(KResponder, [{
    key: "playOfferQueue",
    value: function () {
      var _playOfferQueue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        var job;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!true) {
                  _context4.next = 13;
                  break;
                }

                if (!(this.offerQueue.length > 0)) {
                  _context4.next = 9;
                  break;
                }

                job = this.offerQueue[0];
                console.log("do job", {
                  job: job
                }, this.offerQueue);
                _context4.next = 6;
                return job();

              case 6:
                this.offerQueue.shift();
                _context4.next = 11;
                break;

              case 9:
                _context4.next = 11;
                return new Promise(function (r) {
                  return setTimeout(r, 1000);
                });

              case 11:
                _context4.next = 0;
                break;

              case 13:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function playOfferQueue() {
        return _playOfferQueue.apply(this, arguments);
      };
    }()
  }, {
    key: "response",
    value: function response(rpc, req) {
      console.log("kad rpc", rpc, req);

      if (Object.keys(responder).includes(rpc)) {
        responder[rpc](req);
      }
    }
  }]);

  return KResponder;
}();

exports.default = KResponder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwidGFyZ2V0IiwiaXNTZHAiLCJpc05vZGVFeGlzdCIsInNkcCIsInR5cGUiLCJhbnN3ZXIiLCJwcm94eSIsImNhdGNoIiwicmVmIiwic2V0QW5zd2VyIiwiZXJyb3IiLCJvblN0b3JlIiwia2V5VmFsdWVMaXN0IiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsInB1c2giLCJidWZmZXIiLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwiQnVmZmVyIiwiZnJvbSIsImxlbmd0aCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsInN1Y2Nlc3MiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIl9vbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRp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QUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCN0UsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QjJFLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJNUMsTUFBTSxDQUFDQyxJQUFQLENBQVkxQyxTQUFaLEVBQXVCMkMsUUFBdkIsQ0FBZ0N5QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDcEYsUUFBQUEsU0FBUyxDQUFDb0YsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuaW1wb3J0IGJ1ZmZlcjJhYiBmcm9tIFwiYnVmZmVyLXRvLWFycmF5YnVmZmVyXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgc3RvcmVDaHVua3M6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIC8vIC8v44Kt44O844GM6KGd56qB44GX44Gq44GE5YmN5o+QXG4gICAgICAgIC8vIGlmICghay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldKVxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVfQ0hVTktTXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlQ2h1bmtzID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwic3RvcmVjaHVua3MgYnVmZmVyMmFiXCIsIGJ1ZmZlcjJhYihkYXRhLnZhbHVlKSk7XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGJ1ZmZlcjJhYihkYXRhLnZhbHVlKS5idWZmZXIpO1xuXG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gZGF0YS5zaXplIC0gMSkge1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSB7IGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gfTtcblxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIHRyYW5zZmVyXCIsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwic3RvcmUgYXJyaXZlZFwiLFxuICAgICAgICAgICAgbWluZSxcbiAgICAgICAgICAgIGNsb3NlLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgbGV0IHNlbmREYXRhOiBGaW5kVmFsdWVSO1xuICAgICAgICBpZiAodmFsdWUuY2h1bmtzKSB7XG4gICAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZSBzZW5kIGNodW5rc1wiKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IGFueVtdID0gdmFsdWUuY2h1bmtzO1xuICAgICAgICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgIGNodW5rczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICAgICAga2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLFxuICAgICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8v44K544Oi44O844Or44OV44Kh44Kk44OrXG4gICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiB7IHZhbHVlLCBrZXk6IGRhdGEudGFyZ2V0S2V5IH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3QoZGF0YS50YXJnZXRLZXkpO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZSBzZW5kIHZhbHVlXCIpO1xuICAgICAgICBpZiAocGVlcikge1xuICAgICAgICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWVSID0ge1xuICAgICAgICAgICAgZmFpbDoge1xuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBGaW5kVmFsdWVSID0gbmV0d29yay5kYXRhO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAvL+mAmuW4uOODleOCoeOCpOODq1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoZGF0YS5zdWNjZXNzLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5zdWNjZXNzLmtleV0gPSBkYXRhLnN1Y2Nlc3MudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuY2h1bmtzKSB7XG4gICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHIgY2h1bmtzIGJmMmFiXCIsIGJ1ZmZlcjJhYihkYXRhLmNodW5rcy52YWx1ZSkpO1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0ucHVzaChcbiAgICAgICAgICBidWZmZXIyYWIoZGF0YS5jaHVua3MudmFsdWUpLmJ1ZmZlclxuICAgICAgICApO1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IGRhdGEuY2h1bmtzLnNpemUgLSAxKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgclwiKTtcbiAgICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmNodW5rcy5rZXldID0ge1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5mYWlsICYmIGRhdGEuZmFpbC50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuZmFpbC5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEuZmFpbC50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmROb2RlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBhc3luYyBwbGF5T2ZmZXJRdWV1ZSgpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMub2ZmZXJRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpvYiA9IHRoaXMub2ZmZXJRdWV1ZVswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJkbyBqb2JcIiwgeyBqb2IgfSwgdGhpcy5vZmZlclF1ZXVlKTtcbiAgICAgICAgYXdhaXQgam9iKCk7XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDApKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=