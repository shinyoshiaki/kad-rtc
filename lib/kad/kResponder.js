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
                  k.keyValueList[data.key] = data.value;
                  (0, _kademlia.excuteEvent)(kad.onStore, data.value);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwidGFyZ2V0IiwiaXNTZHAiLCJpc05vZGVFeGlzdCIsInNkcCIsInR5cGUiLCJhbnN3ZXIiLCJwcm94eSIsImNhdGNoIiwicmVmIiwic2V0QW5zd2VyIiwiZXJyb3IiLCJrZXlWYWx1ZUxpc3QiLCJvblN0b3JlIiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwibGVuZ3RoIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwic3VjY2VzcyIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsImZhaWwiLCJ0YXJnZXROb2RlIiwidG8iLCJjYWxsYmFjayIsIl9vbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJGSU5ETk9ERSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJhbGxwZWVyIiwiZ2V0QWxsUGVlcklkcyIsIkZJTkROT0RFX1IiLCJvZmZlclF1ZXVlIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwiX29uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJqb2IiLCJzaGlmdCIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJwYyIsInJlcSJdLCJtYXBw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Q3NCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTVCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUNEOzs7Ozs7Ozs7Ozs7O3FCQUdRLEk7Ozs7O3NCQUNELEtBQUt1RCxVQUFMLENBQWdCbkIsTUFBaEIsR0FBeUIsQzs7Ozs7QUFDckIwQixnQkFBQUEsRyxHQUFNLEtBQUtQLFVBQUwsQ0FBZ0IsQ0FBaEIsQztBQUNaN0QsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0I7QUFBRW1FLGtCQUFBQSxHQUFHLEVBQUhBO0FBQUYsaUJBQXRCLEVBQStCLEtBQUtQLFVBQXBDOzt1QkFDTU8sR0FBRyxFOzs7QUFDVCxxQkFBS1AsVUFBTCxDQUFnQlEsS0FBaEI7Ozs7Ozt1QkFFTSxJQUFJQyxPQUFKLENBQVksVUFBQUMsQ0FBQztBQUFBLHlCQUFJQyxVQUFVLENBQUNELENBQUQsRUFBSSxJQUFKLENBQWQ7QUFBQSxpQkFBYixDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFLSEUsRyxFQUFhQyxHLEVBQVU7QUFDOUIxRSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCd0UsR0FBdkIsRUFBNEJDLEdBQTVCOztBQUNBLFVBQUkxQyxNQUFNLENBQUNDLElBQVAsQ0FBWXpDLFNBQVosRUFBdUIwQyxRQUF2QixDQUFnQ3VDLEdBQWhDLENBQUosRUFBMEM7QUFDeENqRixRQUFBQSxTQUFTLENBQUNpRixHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhLCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4va2FkZW1saWFcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgc3RvcmVDaHVua3M6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KGthZC5vblN0b3JlLCBkYXRhLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV9DSFVOS1NdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YTogU3RvcmVDaHVua3MgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0ucHVzaChkYXRhLnZhbHVlKTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSBkYXRhLnNpemUgLSAxKSB7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9O1xuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy/jgq3jg7zjgpLopovjgaTjgYvjgaPjgZ/jgajjgYTjgYbjg6Hjg4Pjgrvjg7zjgrjjgpLmiLvjgZlcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGxldCBzZW5kRGF0YTogRmluZFZhbHVlUjtcbiAgICAgICAgaWYgKHZhbHVlLmNodW5rcykge1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLFxuICAgICAgICAgICAgICAgIGtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSxcbiAgICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUpO1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IGRhdGEuY2h1bmtzLnNpemUgLSAxKSB7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19