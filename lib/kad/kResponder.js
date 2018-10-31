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

      _this.storeChunks[data.key].push((0, _bufferToArraybuffer.default)(data.value));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwidGFyZ2V0IiwiaXNTZHAiLCJpc05vZGVFeGlzdCIsInNkcCIsInR5cGUiLCJhbnN3ZXIiLCJwcm94eSIsImNhdGNoIiwicmVmIiwic2V0QW5zd2VyIiwiZXJyb3IiLCJvblN0b3JlIiwia2V5VmFsdWVMaXN0IiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwibGVuZ3RoIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwic3VjY2VzcyIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsImZhaWwiLCJ0YXJnZXROb2RlIiwidG8iLCJjYWxsYmFjayIsIl9vbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJGSU5ETk9ERSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJhbGxwZWVyIiwiZ2V0QWxsUGVlcklkcyIsIkZJTkROT0RFX1IiLCJvZmZlclF1ZXVlIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwiX29uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJqb2IiLCJzaGlmdCIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJwYyIsInJlcSJdLCJtYXBw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LEVBL0JzQixDQWdDdEI7O0FBQ0FyRSxnQkFBQUEsQ0FBQyxDQUFDcUUsUUFBRixDQUFXckUsQ0FBQyxDQUFDb0UsS0FBRixDQUFRQyxRQUFuQixFQUE2QjFELEtBQTdCOztBQWpDc0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBNUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFxQ0Q7Ozs7Ozs7Ozs7Ozs7cUJBR1EsSTs7Ozs7c0JBQ0QsS0FBS3VELFVBQUwsQ0FBZ0JuQixNQUFoQixHQUF5QixDOzs7OztBQUNyQjBCLGdCQUFBQSxHLEdBQU0sS0FBS1AsVUFBTCxDQUFnQixDQUFoQixDO0FBQ1o3RCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFbUUsa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1AsVUFBcEM7O3VCQUNNTyxHQUFHLEU7OztBQUNULHFCQUFLUCxVQUFMLENBQWdCUSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QjFFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJ3RSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSTFDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZekMsU0FBWixFQUF1QjBDLFFBQXZCLENBQWdDdUMsR0FBaEMsQ0FBSixFQUEwQztBQUN4Q2pGLFFBQUFBLFNBQVMsQ0FBQ2lGLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgS2FkZW1saWEsIHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCBidWZmZXIyYWIgZnJvbSBcImJ1ZmZlci10by1hcnJheWJ1ZmZlclwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIHN0b3JlQ2h1bmtzOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG4gICAgICBsZXQgaXNTZHAgPSBmYWxzZTtcbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuICAgICAgICAgIGlzU2RwID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrLnJlZlt0YXJnZXRdKTtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgaWYgKCFpc1NkcCkge1xuICAgICAgICAvLyAvL+OCreODvOOBjOihneeqgeOBl+OBquOBhOWJjeaPkFxuICAgICAgICAvLyBpZiAoIWsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSlcbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLm9uU3RvcmUsIGRhdGEudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFX0NIVU5LU10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUNodW5rcyA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGJ1ZmZlcjJhYihkYXRhLnZhbHVlKSk7XG4gICAgICBcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSBkYXRhLnNpemUgLSAxKSB7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9O1xuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwic3RvcmUgYXJyaXZlZFwiLFxuICAgICAgICAgICAgbWluZSxcbiAgICAgICAgICAgIGNsb3NlLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgbGV0IHNlbmREYXRhOiBGaW5kVmFsdWVSO1xuICAgICAgICBpZiAodmFsdWUuY2h1bmtzKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBhbnlbXSA9IHZhbHVlLmNodW5rcztcbiAgICAgICAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICBjaHVua3M6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2h1bmssXG4gICAgICAgICAgICAgICAga2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLFxuICAgICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgc3VjY2VzczogeyB2YWx1ZSwga2V5OiBkYXRhLnRhcmdldEtleSB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0KGRhdGEudGFyZ2V0S2V5KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICAgIGZhaWw6IHtcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YTogRmluZFZhbHVlUiA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgLy/pgJrluLjjg5XjgqHjgqTjg6tcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKGRhdGEuc3VjY2Vzcy52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuc3VjY2Vzcy5rZXldID0gZGF0YS5zdWNjZXNzLnZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmNodW5rcykge1xuICAgICAgICAvL+ODqeODvOOCuOODleOCoeOCpOODq1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0ucHVzaChkYXRhLmNodW5rcy52YWx1ZSk7XG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gZGF0YS5jaHVua3Muc2l6ZSAtIDEpIHtcbiAgICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmNodW5rcy5rZXldID0ge1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5mYWlsICYmIGRhdGEuZmFpbC50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuZmFpbC5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEuZmFpbC50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmROb2RlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBhc3luYyBwbGF5T2ZmZXJRdWV1ZSgpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMub2ZmZXJRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpvYiA9IHRoaXMub2ZmZXJRdWV1ZVswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJkbyBqb2JcIiwgeyBqb2IgfSwgdGhpcy5vZmZlclF1ZXVlKTtcbiAgICAgICAgYXdhaXQgam9iKCk7XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDApKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=