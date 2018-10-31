"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kademlia = require("./kademlia");

var _kadDistance = require("kad-distance");

var _bufferToArraybuffer = _interopRequireDefault(require("buffer-to-arraybuffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
        console.log("store chunks chunks received", _this.storeChunks[data.key]); //レプリケーション

        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        (0, _kademlia.excuteEvent)(kad.onStore, {
          chunks: _this.storeChunks[data.key]
        });
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
        console.log("onfindvalue i have value", {
          value: value
        });
        var peer = k.f.getPeerFromnodeId(network.nodeId);
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
            console.log("findvalue senddata", {
              chunk: chunk
            }, {
              sendData: sendData
            });
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
          console.log("findvalue r", _this.storeChunks[data.chunks.key]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwib25TdG9yZSIsImtleVZhbHVlTGlzdCIsIlNUT1JFX0NIVU5LUyIsImluZGV4Iiwic3RvcmVDaHVua3MiLCJwdXNoIiwiYnVmZmVyIiwic2l6ZSIsImNodW5rcyIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwiZm9yRWFjaCIsImNodW5rIiwiaSIsIkJ1ZmZlciIsImZyb20iLCJsZW5ndGgiLCJzZW5kIiwiRklORFZBTFVFX1IiLCJzdWNjZXNzIiwiaWRzIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiZmFpbCIsInRhcmdldE5vZGUiLCJ0byIsImNhbGxiYWNrIiwiX29uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsImFsbHBlZXIiLCJnZXRBbGxQZWVySWRzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJfb25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1lb3V0IiwicnBjIiwi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QUFBO0FBQUE7QUFxQ0Q7Ozs7Ozs7Ozs7Ozs7cUJBR1EsSTs7Ozs7c0JBQ0QsS0FBSzBELFVBQUwsQ0FBZ0JuQixNQUFoQixHQUF5QixDOzs7OztBQUNyQjBCLGdCQUFBQSxHLEdBQU0sS0FBS1AsVUFBTCxDQUFnQixDQUFoQixDO0FBQ1poRSxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFc0Usa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1AsVUFBcEM7O3VCQUNNTyxHQUFHLEU7OztBQUNULHFCQUFLUCxVQUFMLENBQWdCUSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QjdFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUIyRSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSTVDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZMUMsU0FBWixFQUF1QjJDLFFBQXZCLENBQWdDeUMsR0FBaEMsQ0FBSixFQUEwQztBQUN4Q3BGLFFBQUFBLFNBQVMsQ0FBQ29GLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgS2FkZW1saWEsIHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgYnVmZmVyMmFiIGZyb20gXCJidWZmZXItdG8tYXJyYXlidWZmZXJcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgc3RvcmVDaHVua3M6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIC8vIC8v44Kt44O844GM6KGd56qB44GX44Gq44GE5YmN5o+QXG4gICAgICAgIC8vIGlmICghay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldKVxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVfQ0hVTktTXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlQ2h1bmtzID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwic3RvcmVjaHVua3MgYnVmZmVyMmFiXCIsIGJ1ZmZlcjJhYihkYXRhLnZhbHVlKSk7XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGJ1ZmZlcjJhYihkYXRhLnZhbHVlKS5idWZmZXIpO1xuXG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gZGF0YS5zaXplIC0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rcyBjaHVua3MgcmVjZWl2ZWRcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0pO1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSB7IGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gfTtcblxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgeyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH0pO1xuXG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIHRyYW5zZmVyXCIsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwic3RvcmUgYXJyaXZlZFwiLFxuICAgICAgICAgICAgbWluZSxcbiAgICAgICAgICAgIGNsb3NlLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25maW5kdmFsdWUgaSBoYXZlIHZhbHVlXCIsIHsgdmFsdWUgfSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBsZXQgc2VuZERhdGE6IEZpbmRWYWx1ZVI7XG5cbiAgICAgICAgaWYgKHZhbHVlLmNodW5rcykge1xuICAgICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWUgc2VuZCBjaHVua3NcIik7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBhbnlbXSA9IHZhbHVlLmNodW5rcztcbiAgICAgICAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICBjaHVua3M6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICAgICAgICAgIGtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgc2VuZGRhdGFcIiwgeyBjaHVuayB9LCB7IHNlbmREYXRhIH0pO1xuICAgICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSxcbiAgICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL+OCueODouODvOODq+ODleOCoeOCpOODq1xuICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgc3VjY2VzczogeyB2YWx1ZSwga2V5OiBkYXRhLnRhcmdldEtleSB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0KGRhdGEudGFyZ2V0S2V5KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICAgIGZhaWw6IHtcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgciBjaHVua3MgYmYyYWJcIiwgYnVmZmVyMmFiKGRhdGEuY2h1bmtzLnZhbHVlKSk7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XS5wdXNoKFxuICAgICAgICAgIGJ1ZmZlcjJhYihkYXRhLmNodW5rcy52YWx1ZSkuYnVmZmVyXG4gICAgICAgICk7XG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gZGF0YS5jaHVua3Muc2l6ZSAtIDEpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSByXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSk7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh7XG4gICAgICAgICAgICBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19