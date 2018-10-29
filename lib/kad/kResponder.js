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
        var data, mine, close, target;
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
                } //レプリケーション


                k.keyValueList[data.key] = data.value;
                (0, _kademlia.excuteEvent)(kad.onStore, data.value);
                target = data.sender;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 18;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 18;
                  break;
                }

                console.log("is signaling");

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
          console.log("store arrived", mine, close, "\ndata", data);
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

          k.callback._onFindValue(_this.storeChunks[data.chunks.key]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwia2V5VmFsdWVMaXN0Iiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIlNUT1JFX0NIVU5LUyIsImluZGV4Iiwic3RvcmVDaHVua3MiLCJwdXNoIiwic2l6ZSIsImNodW5rcyIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwiZm9yRWFjaCIsImNodW5rIiwiaSIsImxlbmd0aCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsInN1Y2Nlc3MiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIl9vbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7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Q0FBZ0JuQixNQUFoQixHQUF5QixDOzs7OztBQUNyQjBCLGdCQUFBQSxHLEdBQU0sS0FBS1AsVUFBTCxDQUFnQixDQUFoQixDO0FBQ1o1RCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFa0Usa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1AsVUFBcEM7O3VCQUNNTyxHQUFHLEU7OztBQUNULHFCQUFLUCxVQUFMLENBQWdCUSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QnpFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJ1RSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSTFDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZeEMsU0FBWixFQUF1QnlDLFFBQXZCLENBQWdDdUMsR0FBaEMsQ0FBSixFQUEwQztBQUN4Q2hGLFFBQUFBLFNBQVMsQ0FBQ2dGLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgS2FkZW1saWEsIHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgb2ZmZXJRdWV1ZTogQXJyYXk8YW55PiA9IFtdO1xuICBzdG9yZUNodW5rczogeyBba2V5OiBzdHJpbmddOiBhbnlbXSB9ID0ge307XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICBjb25zdCBrID0ga2FkO1xuICAgIHRoaXMucGxheU9mZmVyUXVldWUoKTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlRm9ybWF0ID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/oh6rliIbjgajpgIHkv6HlhYPjga7ot53pm6JcbiAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgLy/oh6rliIbjga5rYnVja2V0c+S4reOBp+mAgeS/oeWFg+OBq+S4gOeVqui/keOBhOi3nembolxuICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8vc3RvcmXjgZfnm7TjgZlcbiAgICAgICAgay5zdG9yZShkYXRhLnNlbmRlciwgZGF0YS5rZXksIGRhdGEudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICB9XG4gICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIGV4Y3V0ZUV2ZW50KGthZC5vblN0b3JlLCBkYXRhLnZhbHVlKTtcblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV9DSFVOS1NdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YTogU3RvcmVDaHVua3MgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0ucHVzaChkYXRhLnZhbHVlKTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSBkYXRhLnNpemUgLSAxKSB7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9O1xuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy/jgq3jg7zjgpLopovjgaTjgYvjgaPjgZ/jgajjgYTjgYbjg6Hjg4Pjgrvjg7zjgrjjgpLmiLvjgZlcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGxldCBzZW5kRGF0YTogRmluZFZhbHVlUjtcbiAgICAgICAgaWYgKHZhbHVlLmNodW5rcykge1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLFxuICAgICAgICAgICAgICAgIGtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSxcbiAgICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUpO1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IGRhdGEuY2h1bmtzLnNpemUgLSAxKSB7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19