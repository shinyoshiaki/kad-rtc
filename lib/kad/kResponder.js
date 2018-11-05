"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kademlia = require("./kademlia");

var _kadDistance = require("kad-distance");

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
                data = network.data;

                if (k.cypher.decrypt(data.sign, data.pubKey) === data.hash) {
                  _context.next = 5;
                  break;
                }

                console.log("invalid store");
                return _context.abrupt("return");

              case 5:
                //自分と送信元の距離
                mine = (0, _kadDistance.distance)(k.nodeId, data.key); //自分のkbuckets中で送信元に一番近い距離

                close = k.f.getCloseEstDist(data.key);

                if (mine > close) {
                  console.log("store transfer", "\ndata", data); //storeし直す

                  k.store(data.sender, data.key, data.value, {
                    excludeId: network.nodeId
                  });
                } else {
                  console.log("store arrived", mine, close, "\ndata", data);
                }

                target = data.sender;
                isSdp = false;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 21;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 21;
                  break;
                }

                console.log("is signaling");
                isSdp = true;

                if (!(data.value.sdp.type === "offer")) {
                  _context.next = 20;
                  break;
                }

                console.log("kad received offer", data.sender);
                _context.next = 18;
                return k.answer(target, data.value.sdp, data.value.proxy).catch(console.log);

              case 18:
                _context.next = 21;
                break;

              case 20:
                if (data.value.sdp.type === "answer") {
                  console.log("kad received answer", data.sender);

                  try {
                    console.log(k.ref[target]);
                    k.ref[target].setAnswer(data.value.sdp);
                  } catch (error) {
                    console.log(error);
                  }
                }

              case 21:
                //レプリケーション
                if (!isSdp) {
                  (0, _kademlia.excuteEvent)(kad.onStore, data.value);
                  k.keyValueList[data.key] = data.value;
                }

              case 22:
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

      if (!(k.cypher.decrypt(data.sign, data.pubKey) === data.hash)) {
        console.log("invalid store chunks");
        return;
      }

      if (data.index === 0) {
        _this.storeChunks[data.key] = [];
      }

      console.log("storechunks buffer2ab", data.value.buffer);

      _this.storeChunks[data.key].push(data.value.buffer);

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
          k.storeChunks(data.sender, data.key, _this.storeChunks[data.key], {
            excludeId: network.nodeId
          });
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
      var data = network.data;
      console.log("findvalue r", {
        data: data
      }); //valueを発見していれば

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

        console.log("findvalue r chunks bf2ab", data.chunks, data.chunks.value.buffer);

        _this.storeChunks[data.chunks.key].push(data.chunks.value.buffer);

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
                  _context3.next = 14;
                  break;
                }

                console.log("not found"); //ノードIDが見つからなければ

                if (ids.includes(k.state.findNode)) {
                  _context3.next = 14;
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

                _context3.next = 14;
                return k.findNode(k.state.findNode, close).catch(console.log);

              case 14:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJjeXBoZXIiLCJkZWNyeXB0Iiwic2lnbiIsInB1YktleSIsImhhc2giLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV4Y2x1ZGVJZCIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwib25TdG9yZSIsImtleVZhbHVlTGlzdCIsIlNUT1JFX0NIVU5LUyIsImluZGV4Iiwic3RvcmVDaHVua3MiLCJidWZmZXIiLCJwdXNoIiwic2l6ZSIsImNodW5rcyIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwiZm9yRWFjaCIsImNodW5rIiwiaSIsIkJ1ZmZlciIsImZyb20iLCJsZW5ndGgiLCJzZW5kIiwiRklORFZBTFVFX1IiLCJzdWNjZXNzIiwiaWRzIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiZmFpbCIsInRhcmdldE5vZGUiLCJ0byIsImNhbGxiYWNrIiwiX29uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsImFsbHBlZXIiLCJnZXRBbGxQZWVySWRzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJfb25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImpvYiIs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RTs7O0FBQ1QscUJBQUtOLFVBQUwsQ0FBZ0JPLEtBQWhCOzs7Ozs7dUJBRU0sSUFBSUMsT0FBSixDQUFZLFVBQUFDLENBQUM7QUFBQSx5QkFBSUMsVUFBVSxDQUFDRCxDQUFELEVBQUksSUFBSixDQUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCbEYsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QmdGLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJM0MsTUFBTSxDQUFDQyxJQUFQLENBQVloRCxTQUFaLEVBQXVCaUQsUUFBdkIsQ0FBZ0N3QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDekYsUUFBQUEsU0FBUyxDQUFDeUYsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgc3RvcmVDaHVua3M6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG5cbiAgICAgIGlmICghKGsuY3lwaGVyLmRlY3J5cHQoZGF0YS5zaWduLCBkYXRhLnB1YktleSkgPT09IGRhdGEuaGFzaCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpbnZhbGlkIHN0b3JlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlLCB7XG4gICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KGthZC5vblN0b3JlLCBkYXRhLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV9DSFVOS1NdID0gKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlQ2h1bmtzID0gbmV0d29yay5kYXRhO1xuXG4gICAgICBpZiAoIShrLmN5cGhlci5kZWNyeXB0KGRhdGEuc2lnbiwgZGF0YS5wdWJLZXkpID09PSBkYXRhLmhhc2gpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW52YWxpZCBzdG9yZSBjaHVua3NcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwic3RvcmVjaHVua3MgYnVmZmVyMmFiXCIsIGRhdGEudmFsdWUuYnVmZmVyKTtcbiAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldLnB1c2goZGF0YS52YWx1ZS5idWZmZXIpO1xuXG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gZGF0YS5zaXplIC0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rcyBjaHVua3MgcmVjZWl2ZWRcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0pO1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSB7IGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gfTtcblxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgeyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH0pO1xuXG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIHRyYW5zZmVyXCIsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldLCB7XG4gICAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIGFycml2ZWRcIixcbiAgICAgICAgICAgIG1pbmUsXG4gICAgICAgICAgICBjbG9zZSxcbiAgICAgICAgICAgIFwiXFxuZGF0YVwiLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uZmluZHZhbHVlIGkgaGF2ZSB2YWx1ZVwiLCB7IHZhbHVlIH0pO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgbGV0IHNlbmREYXRhOiBGaW5kVmFsdWVSO1xuXG4gICAgICAgIGlmICh2YWx1ZS5jaHVua3MpIHtcbiAgICAgICAgICAvL+ODqeODvOOCuOODleOCoeOCpOODq1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlIHNlbmQgY2h1bmtzXCIpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgICAgICAgICBrZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHNlbmRkYXRhXCIsIHsgY2h1bmsgfSwgeyBzZW5kRGF0YSB9KTtcbiAgICAgICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksXG4gICAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy/jgrnjg6Ljg7zjg6vjg5XjgqHjgqTjg6tcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBGaW5kVmFsdWVSID0gbmV0d29yay5kYXRhO1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgclwiLCB7IGRhdGEgfSk7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJmaW5kdmFsdWUgciBjaHVua3MgYmYyYWJcIixcbiAgICAgICAgICBkYXRhLmNodW5rcyxcbiAgICAgICAgICBkYXRhLmNodW5rcy52YWx1ZS5idWZmZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUuYnVmZmVyKTtcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSBkYXRhLmNodW5rcy5zaXplIC0gMSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHJcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldKTtcbiAgICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmNodW5rcy5rZXldID0ge1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5mYWlsICYmIGRhdGEuZmFpbC50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuZmFpbC5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEuZmFpbC50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmROb2RlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBhd2FpdCBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19