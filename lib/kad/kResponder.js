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

// import buffer2ab from "buffer-to-arraybuffer";
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

                  k.store(data.sender, data.key, data.value, {
                    excludeId: network.nodeId
                  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV4Y2x1ZGVJZCIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwib25TdG9yZSIsImtleVZhbHVlTGlzdCIsIlNUT1JFX0NIVU5LUyIsImluZGV4Iiwic3RvcmVDaHVua3MiLCJidWZmZXIiLCJwdXNoIiwic2l6ZSIsImNodW5rcyIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwiZm9yRWFjaCIsImNodW5rIiwiaSIsIkJ1ZmZlciIsImZyb20iLCJsZW5ndGgiLCJzZW5kIiwiRklORFZBTFVFX1IiLCJzdWNjZXNzIiwiaWRzIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiZmFpbCIsInRhcmdldE5vZGUiLCJ0byIsImNhbGxiYWNrIiwiX29uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsImFsbHBlZXIiLCJnZXRBbGxQZWVySWRzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJfb25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1lb3V0IiwicnBjIiwi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MkJBQVosRUFBeUNOLENBQUMsQ0FBQ3dFLEtBQUYsQ0FBUUMsUUFBakQsRUEvQnNCLENBZ0N0Qjs7QUFDQXpFLGdCQUFBQSxDQUFDLENBQUN5RSxRQUFGLENBQVd6RSxDQUFDLENBQUN3RSxLQUFGLENBQVFDLFFBQW5CLEVBQTZCOUQsS0FBN0I7O0FBakNzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXFDRDs7Ozs7Ozs7Ozs7OztxQkFHUSxJOzs7OztzQkFDRCxLQUFLMkQsVUFBTCxDQUFnQm5CLE1BQWhCLEdBQXlCLEM7Ozs7O0FBQ3JCeUIsZ0JBQUFBLEcsR0FBTSxLQUFLTixVQUFMLENBQWdCLENBQWhCLEM7QUFDWmpFLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCO0FBQUVzRSxrQkFBQUEsR0FBRyxFQUFIQTtBQUFGLGlCQUF0QixFQUErQixLQUFLTixVQUFwQzs7dUJBQ01NLEdBQUcsRTs7O0FBQ1QscUJBQUtOLFVBQUwsQ0FBZ0JPLEtBQWhCOzs7Ozs7dUJBRU0sSUFBSUMsT0FBSixDQUFZLFVBQUFDLENBQUM7QUFBQSx5QkFBSUMsVUFBVSxDQUFDRCxDQUFELEVBQUksSUFBSixDQUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCN0UsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QjJFLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJM0MsTUFBTSxDQUFDQyxJQUFQLENBQVkzQyxTQUFaLEVBQXVCNEMsUUFBdkIsQ0FBZ0N3QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDcEYsUUFBQUEsU0FBUyxDQUFDb0YsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbi8vIGltcG9ydCBidWZmZXIyYWIgZnJvbSBcImJ1ZmZlci10by1hcnJheWJ1ZmZlclwiO1xuXG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgb2ZmZXJRdWV1ZTogQXJyYXk8YW55PiA9IFtdO1xuICBzdG9yZUNodW5rczogeyBba2V5OiBzdHJpbmddOiBhbnlbXSB9ID0ge307XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICBjb25zdCBrID0ga2FkO1xuICAgIHRoaXMucGxheU9mZmVyUXVldWUoKTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlLCB7XG4gICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIC8vIC8v44Kt44O844GM6KGd56qB44GX44Gq44GE5YmN5o+QXG4gICAgICAgIC8vIGlmICghay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldKVxuICAgICAgICBleGN1dGVFdmVudChrYWQub25TdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVfQ0hVTktTXSA9IChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUNodW5rcyA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldID0gW107XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcInN0b3JlY2h1bmtzIGJ1ZmZlcjJhYlwiLCBkYXRhLnZhbHVlLmJ1ZmZlcik7XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGRhdGEudmFsdWUuYnVmZmVyKTtcblxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IGRhdGEuc2l6ZSAtIDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3MgY2h1bmtzIHJlY2VpdmVkXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0geyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH07XG5cbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLm9uU3RvcmUsIHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9KTtcblxuICAgICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSB0cmFuc2ZlclwiLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICAgIGsuc3RvcmVDaHVua3MoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSBhcnJpdmVkXCIsXG4gICAgICAgICAgICBtaW5lLFxuICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvbmZpbmR2YWx1ZSBpIGhhdmUgdmFsdWVcIiwgeyB2YWx1ZSB9KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGxldCBzZW5kRGF0YTogRmluZFZhbHVlUjtcblxuICAgICAgICBpZiAodmFsdWUuY2h1bmtzKSB7XG4gICAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZSBzZW5kIGNodW5rc1wiKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IGFueVtdID0gdmFsdWUuY2h1bmtzO1xuICAgICAgICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgIGNodW5rczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICAgICAga2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBzZW5kZGF0YVwiLCB7IGNodW5rIH0sIHsgc2VuZERhdGEgfSk7XG4gICAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLFxuICAgICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8v44K544Oi44O844Or44OV44Kh44Kk44OrXG4gICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiB7IHZhbHVlLCBrZXk6IGRhdGEudGFyZ2V0S2V5IH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3QoZGF0YS50YXJnZXRLZXkpO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZSBzZW5kIHZhbHVlXCIpO1xuICAgICAgICBpZiAocGVlcikge1xuICAgICAgICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWVSID0ge1xuICAgICAgICAgICAgZmFpbDoge1xuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogbmV0d29yaykgPT4ge1xuICAgICAgY29uc3QgZGF0YTogRmluZFZhbHVlUiA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHJcIiwgeyBkYXRhIH0pO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAvL+mAmuW4uOODleOCoeOCpOODq1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoZGF0YS5zdWNjZXNzLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5zdWNjZXNzLmtleV0gPSBkYXRhLnN1Y2Nlc3MudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuY2h1bmtzKSB7XG4gICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiZmluZHZhbHVlIHIgY2h1bmtzIGJmMmFiXCIsXG4gICAgICAgICAgZGF0YS5jaHVua3MsXG4gICAgICAgICAgZGF0YS5jaHVua3MudmFsdWUuYnVmZmVyXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XS5wdXNoKGRhdGEuY2h1bmtzLnZhbHVlLmJ1ZmZlcik7XG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gZGF0YS5jaHVua3Muc2l6ZSAtIDEpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSByXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSk7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh7XG4gICAgICAgICAgICBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19