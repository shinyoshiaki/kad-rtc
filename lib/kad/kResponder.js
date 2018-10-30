"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kademlia = require("./kademlia");

var _kadDistance = require("kad-distance");

var _bson = require("bson");

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
                  //キーが衝突しない前提
                  if (!k.keyValueList[data.key]) (0, _kademlia.excuteEvent)(kad.onStore, data.value);
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

      _this.storeChunks[data.key].push(data.value);

      if (data.index === data.size - 1) {
        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        (0, _kademlia.excuteEvent)(kad.onStore, data.value);
        var mine = (0, _kadDistance.distance)(k.nodeId, data.key);
        var close = k.f.getCloseEstDist(data.key);

        if (mine > close) {
          console.log("store transfer", "\ndata", data);
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
          var chunks = value.chunks;
          chunks.forEach(function (chunk, i) {
            sendData = {
              chunks: {
                value: chunk,
                key: data.targetKey,
                index: i,
                size: chunks.length
              }
            };
            peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
          });
        } else {
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

        _this.storeChunks[data.chunks.key].push(data.chunks.value);

        if (data.chunks.index === data.chunks.size - 1) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwidGFyZ2V0IiwiaXNTZHAiLCJpc05vZGVFeGlzdCIsInNkcCIsInR5cGUiLCJhbnN3ZXIiLCJwcm94eSIsImNhdGNoIiwicmVmIiwic2V0QW5zd2VyIiwiZXJyb3IiLCJrZXlWYWx1ZUxpc3QiLCJvblN0b3JlIiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwibGVuZ3RoIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwic3VjY2VzcyIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsImZhaWwiLCJ0YXJnZXROb2RlIiwidG8iLCJjYWxsYmFjayIsIl9vbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJGSU5ETk9ERSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJhbGxwZWVyIiwiZ2V0QWxsUGVlcklkcyIsIkZJTkROT0RFX1IiLCJvZmZlclF1ZXVlIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwiX29uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJqb2IiLCJzaGlmdCIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJwYyIsInJlcSJdLCJtYXBw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MkJBQVosRUFBeUNOLENBQUMsQ0FBQ29FLEtBQUYsQ0FBUUMsUUFBakQsRUEvQnNCLENBZ0N0Qjs7QUFDQXJFLGdCQUFBQSxDQUFDLENBQUNxRSxRQUFGLENBQVdyRSxDQUFDLENBQUNvRSxLQUFGLENBQVFDLFFBQW5CLEVBQTZCMUQsS0FBN0I7O0FBakNzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXFDRDs7Ozs7Ozs7Ozs7OztxQkFHUSxJOzs7OztzQkFDRCxLQUFLdUQsVUFBTCxDQUFnQm5CLE1BQWhCLEdBQXlCLEM7Ozs7O0FBQ3JCMEIsZ0JBQUFBLEcsR0FBTSxLQUFLUCxVQUFMLENBQWdCLENBQWhCLEM7QUFDWjdELGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCO0FBQUVtRSxrQkFBQUEsR0FBRyxFQUFIQTtBQUFGLGlCQUF0QixFQUErQixLQUFLUCxVQUFwQzs7dUJBQ01PLEdBQUcsRTs7O0FBQ1QscUJBQUtQLFVBQUwsQ0FBZ0JRLEtBQWhCOzs7Ozs7dUJBRU0sSUFBSUMsT0FBSixDQUFZLFVBQUFDLENBQUM7QUFBQSx5QkFBSUMsVUFBVSxDQUFDRCxDQUFELEVBQUksSUFBSixDQUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCMUUsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QndFLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJMUMsTUFBTSxDQUFDQyxJQUFQLENBQVl6QyxTQUFaLEVBQXVCMEMsUUFBdkIsQ0FBZ0N1QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDakYsUUFBQUEsU0FBUyxDQUFDaUYsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIHN0b3JlQ2h1bmtzOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG4gICAgICBsZXQgaXNTZHAgPSBmYWxzZTtcbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuICAgICAgICAgIGlzU2RwID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrLnJlZlt0YXJnZXRdKTtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgaWYgKCFpc1NkcCkge1xuICAgICAgICAvL+OCreODvOOBjOihneeqgeOBl+OBquOBhOWJjeaPkFxuICAgICAgICBpZiAoIWsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSkgZXhjdXRlRXZlbnQoa2FkLm9uU3RvcmUsIGRhdGEudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFX0NIVU5LU10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUNodW5rcyA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGRhdGEudmFsdWUpO1xuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IGRhdGEuc2l6ZSAtIDEpIHtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0geyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH07XG4gICAgICAgIGV4Y3V0ZUV2ZW50KGthZC5vblN0b3JlLCBkYXRhLnZhbHVlKTtcbiAgICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgICBrLnN0b3JlQ2h1bmtzKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSBhcnJpdmVkXCIsXG4gICAgICAgICAgICBtaW5lLFxuICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBsZXQgc2VuZERhdGE6IEZpbmRWYWx1ZVI7XG4gICAgICAgIGlmICh2YWx1ZS5jaHVua3MpIHtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IGFueVtdID0gdmFsdWUuY2h1bmtzO1xuICAgICAgICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgIGNodW5rczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuayxcbiAgICAgICAgICAgICAgICBrZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksXG4gICAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiB7IHZhbHVlLCBrZXk6IGRhdGEudGFyZ2V0S2V5IH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3QoZGF0YS50YXJnZXRLZXkpO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZSBzZW5kIHZhbHVlXCIpO1xuICAgICAgICBpZiAocGVlcikge1xuICAgICAgICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWVSID0ge1xuICAgICAgICAgICAgZmFpbDoge1xuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBGaW5kVmFsdWVSID0gbmV0d29yay5kYXRhO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAvL+mAmuW4uOODleOCoeOCpOODq1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoZGF0YS5zdWNjZXNzLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5zdWNjZXNzLmtleV0gPSBkYXRhLnN1Y2Nlc3MudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuY2h1bmtzKSB7XG4gICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XS5wdXNoKGRhdGEuY2h1bmtzLnZhbHVlKTtcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSBkYXRhLmNodW5rcy5zaXplIC0gMSkge1xuICAgICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuY2h1bmtzLmtleV0gPSB7XG4gICAgICAgICAgICBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XVxuICAgICAgICAgIH07XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoe1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkYXRhLmZhaWwgJiYgZGF0YS5mYWlsLnRvID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuRklORFZBTFVFX1IsIFwicmUgZmluZFwiLCBkYXRhKTtcbiAgICAgICAgLy/nmbropovjgafjgY3jgabjgYTjgarjgZHjgozjgbDlgJnoo5zjgavlr77jgZfjgablho3mjqLntKJcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5mYWlsLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS5mYWlsLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+imgeaxguOBleOCjOOBn+OCreODvOOBq+i/keOBhOikh+aVsOOBruOCreODvOOCkumAgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IGNsb3NlSURzOiBrLmYuZ2V0Q2xvc2VJRHMoZGF0YS50YXJnZXRLZXkpIH07XG5cbiAgICAgIGNvbnNvbGUubG9nKG5ldHdvcmsubm9kZUlkLCB7XG4gICAgICAgIGFsbHBlZXI6IGsuZi5nZXRBbGxQZWVySWRzKCksXG4gICAgICAgIGlkczogc2VuZERhdGEuY2xvc2VJRHNcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIiwgc2VuZERhdGEuY2xvc2VJRHMpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgaW4gaWRzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGlkc1trZXldO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvZmZlcnF1ZSBydW5cIiwgdGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgaPjgZ/jgonjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZE5vZGUodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+WIneacn+WLleS9nOOBrmZpbmRub2Rl44Gn44Gq44GR44KM44GwXG4gICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSAhPT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJub3QgZm91bmRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgonjgarjgZHjgozjgbBcbiAgICAgICAgaWYgKCFpZHMuaW5jbHVkZXMoay5zdGF0ZS5maW5kTm9kZSkpIHtcbiAgICAgICAgICAvL+WVj+OBhOWQiOOCj+OBm+WFiOOCkumZpOWkllxuICAgICAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0UGVlcihrLnN0YXRlLmZpbmROb2RlLCB7XG4gICAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGUtciBrZWVwIGZpbmQgbm9kZVwiLCBrLnN0YXRlLmZpbmROb2RlKTtcbiAgICAgICAgICAvL+WGjeaOoue0olxuICAgICAgICAgIGsuZmluZE5vZGUoay5zdGF0ZS5maW5kTm9kZSwgY2xvc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHBsYXlPZmZlclF1ZXVlKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vZmZlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgam9iID0gdGhpcy5vZmZlclF1ZXVlWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRvIGpvYlwiLCB7IGpvYiB9LCB0aGlzLm9mZmVyUXVldWUpO1xuICAgICAgICBhd2FpdCBqb2IoKTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc3BvbnNlKHJwYzogc3RyaW5nLCByZXE6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIHJwY1wiLCBycGMsIHJlcSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKHJlc3BvbmRlcikuaW5jbHVkZXMocnBjKSkge1xuICAgICAgcmVzcG9uZGVyW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==