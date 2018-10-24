"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

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

                  k.store(data.sender, data.key, data.value); //レプリケーション

                  k.keyValueList[data.key] = data.value;
                } else {
                  console.log("store arrived", mine, close, "\ndata", data); //受け取る

                  k.keyValueList[data.key] = data.value;
                  k.callback.onStore(k.keyValueList);
                }

                target = data.sender;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 16;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 16;
                  break;
                }

                console.log("is signaling");

                if (!(data.value.sdp.type === "offer")) {
                  _context.next = 15;
                  break;
                }

                console.log("kad received offer", data.sender);
                _context.next = 13;
                return k.answer(target, data.value.sdp, data.value.proxy).catch(console.log);

              case 13:
                _context.next = 16;
                break;

              case 15:
                if (data.value.sdp.type === "answer") {
                  console.log("kad received answer", data.sender);

                  try {
                    console.log(k.ref[target]);
                    k.ref[target].setAnswer(data.value.sdp);
                  } catch (error) {
                    console.log(error);
                  }
                }

              case 16:
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

    responder[_KConst.default.FINDVALUE] = function (network) {
      console.log("on findvalue", network.nodeId);
      var data = network.data; //ターゲットのキーを持っていたら

      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        var value = k.keyValueList[data.targetKey];
        var peer = k.f.getPeerFromnodeId(network.nodeId); //キーを見つかったというメッセージを戻す

        if (!peer) return;
        var sendData = {
          success: {
            value: value,
            key: data.targetKey
          }
        };
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
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
        console.log("findvalue found");
        k.callback.onFindValue(data.success.value); //レプリケーション

        k.keyValueList[data.success.key] = data.success.value;
      } else if (data.fail && data.fail.to === k.nodeId) {
        console.log(_KConst.default.FINDVALUE_R, "re find", data); //発見できていなければ候補に対して再探索

        for (var id in data.fail.ids) {
          var peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.fail.targetKey, peer);
        }
      }
    };

    responder[_KConst.default.PING] = function (network) {
      var data = network.data;

      if (data.target === k.nodeId) {
        console.log("ping received"); //ノードIDからピアを取得

        var peer = k.f.getPeerFromnodeId(network.nodeId);
        if (!peer) return;
        var sendData = {
          target: network.nodeId
        };
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.PONG, sendData), "kad");
      }
    };

    responder[_KConst.default.PONG] = function (network) {
      var data = network.data;

      if (data.target === k.nodeId) {
        console.log("pong received", network.nodeId); //pingのコールバック

        k.callback._onPing[network.nodeId]();
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
        var data, ids, _loop, key, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);

                _loop = function _loop(key) {
                  var target = ids[key];

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
                    k.callback.onFindNode();
                  }
                };

                for (key in ids) {
                  _loop(key);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImtleVZhbHVlTGlzdCIsImNhbGxiYWNrIiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwic3VjY2VzcyIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsImZhaWwiLCJ0YXJnZXROb2RlIiwidG8iLCJvbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwiUE9ORyIsIl9vblBpbmciLCJGSU5ETk9ERSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJhbGxwZWVyIiwiZ2V0QWxsUGVlcklkcyIsIkZJTkROT0RFX1IiLCJvZmZlclF1ZXVlIiwicHVzaCIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIm9uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJsZW5ndGgiLCJqb2IiLCJzaGlmdCIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJwYyIsInJlcSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZCOztJQUVxQkMs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LEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICBjb25zdCBrID0ga2FkO1xuICAgIHRoaXMucGxheU9mZmVyUXVldWUoKTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlRm9ybWF0ID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/oh6rliIbjgajpgIHkv6HlhYPjga7ot53pm6JcbiAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgLy/oh6rliIbjga5rYnVja2V0c+S4reOBp+mAgeS/oeWFg+OBq+S4gOeVqui/keOBhOi3nembolxuICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8vc3RvcmXjgZfnm7TjgZlcbiAgICAgICAgay5zdG9yZShkYXRhLnNlbmRlciwgZGF0YS5rZXksIGRhdGEudmFsdWUpO1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8v5Y+X44GR5Y+W44KLXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGsuY2FsbGJhY2sub25TdG9yZShrLmtleVZhbHVlTGlzdCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuXG4gICAgICBpZiAoZGF0YS5rZXkgPT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcblxuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgc3VjY2VzczogeyB2YWx1ZSwga2V5OiBkYXRhLnRhcmdldEtleSB9XG4gICAgICAgIH07XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0KGRhdGEudGFyZ2V0S2V5KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICAgIGZhaWw6IHtcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YTogRmluZFZhbHVlUiA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2sub25GaW5kVmFsdWUoZGF0YS5zdWNjZXNzLnZhbHVlKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5zdWNjZXNzLmtleV0gPSBkYXRhLnN1Y2Nlc3MudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlBJTkddID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLnRhcmdldCA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHJlY2VpdmVkXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GL44KJ44OU44Ki44KS5Y+W5b6XXG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogbmV0d29yay5ub2RlSWQgfTtcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5QT05HLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlBPTkddID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLnRhcmdldCA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwb25nIHJlY2VpdmVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy9waW5n44Gu44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGsuY2FsbGJhY2suX29uUGluZ1tuZXR3b3JrLm5vZGVJZF0oKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+imgeaxguOBleOCjOOBn+OCreODvOOBq+i/keOBhOikh+aVsOOBruOCreODvOOCkumAgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IGNsb3NlSURzOiBrLmYuZ2V0Q2xvc2VJRHMoZGF0YS50YXJnZXRLZXkpIH07XG5cbiAgICAgIGNvbnNvbGUubG9nKG5ldHdvcmsubm9kZUlkLCB7XG4gICAgICAgIGFsbHBlZXI6IGsuZi5nZXRBbGxQZWVySWRzKCksXG4gICAgICAgIGlkczogc2VuZERhdGEuY2xvc2VJRHNcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIiwgc2VuZERhdGEuY2xvc2VJRHMpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgaW4gaWRzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGlkc1trZXldO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvZmZlcnF1ZSBydW5cIiwgdGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgaPjgZ/jgonjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19