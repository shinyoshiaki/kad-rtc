"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha1"));

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kadDistance = require("kad-distance");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

                  k.store(data.sender, data.key, data.value);
                } else {
                  console.log("store arrived", mine, close, "\ndata", data); //受け取る

                  k.keyValueList[(0, _sha.default)(data.value).toString()] = data.value;
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
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, {
          find: true,
          value: value
        }), "kad");
      } else {
        //キーに最も近いピア
        var ids = k.f.getCloseEstIdsList;

        var _peer = k.f.getPeerFromnodeId(network.nodeId);

        console.log("re send value", (0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, {
          find: false,
          ids: ids,
          targetNode: data.targetNode,
          targetKey: data.targetKey,
          to: network.nodeId
        }));
        if (_peer) _peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, {
          find: false,
          ids: ids,
          targetNode: data.targetNode,
          targetKey: data.targetKey,
          to: network.nodeId
        }), "kad");
      }
    };

    responder[_KConst.default.FINDVALUE_R] = function (network) {
      var data = network.data; //valueを発見していれば

      if (data.find) {
        console.log("findvalue found");
        k.callback.onFindValue(data.value);
      } else if (data.to === k.nodeId) {
        console.log(_KConst.default.FINDVALUE_R, "re find", data); //発見できていなければ候補に対して再探索

        for (var id in data.ids) {
          var peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.targetKey, peer);
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
        var data, ids, _loop, target, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);

                _loop = function _loop(target) {
                  _this.offerQueue.push(
                  /*#__PURE__*/
                  _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2() {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            if (!(target !== k.nodeId && !k.f.isNodeExist(target))) {
                              _context2.next = 3;
                              break;
                            }

                            _context2.next = 3;
                            return k.offer(target, network.nodeId).catch(console.log);

                          case 3:
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

                for (target in ids) {
                  _loop(target);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImtleVZhbHVlTGlzdCIsInRvU3RyaW5nIiwiY2FsbGJhY2siLCJvblN0b3JlIiwidGFyZ2V0IiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwiZmluZCIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsInRhcmdldE5vZGUiLCJ0byIsIm9uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIlBJTkciLCJzZW5kRGF0YSIsIlBPTkciLCJfb25QaW5nIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJwdXNoIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwib25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsImxlbmd0aCIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1lb3V0IiwicnBjIiwicmVxIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQWMsR0FBRyxFQUF2Qjs7SUFFcUJDLFU7OztBQUVuQixzQkFBWUMs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QkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFMkQsa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1QsVUFBcEM7O3VCQUNNUyxHQUFHLEU7OztBQUNULHFCQUFLVCxVQUFMLENBQWdCVSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QmxFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJnRSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSXZDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZcEMsU0FBWixFQUF1QnFDLFFBQXZCLENBQWdDb0MsR0FBaEMsQ0FBSixFQUEwQztBQUN4Q3pFLFFBQUFBLFNBQVMsQ0FBQ3lFLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL+WPl+OBkeWPluOCi1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtzaGExKGRhdGEudmFsdWUpLnRvU3RyaW5nKCldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgay5jYWxsYmFjay5vblN0b3JlKGsua2V5VmFsdWVMaXN0KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICBmaW5kOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgXCJrYWRcIlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdDtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwicmUgc2VuZCB2YWx1ZVwiLFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgZmluZDogZmFsc2UsXG4gICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICBpZiAocGVlcilcbiAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHtcbiAgICAgICAgICAgICAgZmluZDogZmFsc2UsXG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuZmluZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5vbkZpbmRWYWx1ZShkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QSU5HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyByZWNlaXZlZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBi+OCieODlOOCouOCkuWPluW+l1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IG5ldHdvcmsubm9kZUlkIH07XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuUE9ORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QT05HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9uZyByZWNlaXZlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8vcGluZ+OBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBrLmNhbGxiYWNrLl9vblBpbmdbbmV0d29yay5ub2RlSWRdKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQgdGFyZ2V0IGluIGlkcykge1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLm9uRmluZE5vZGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+WIneacn+WLleS9nOOBrmZpbmRub2Rl44Gn44Gq44GR44KM44GwXG4gICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSAhPT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJub3QgZm91bmRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgonjgarjgZHjgozjgbBcbiAgICAgICAgaWYgKCFpZHMuaW5jbHVkZXMoay5zdGF0ZS5maW5kTm9kZSkpIHtcbiAgICAgICAgICAvL+WVj+OBhOWQiOOCj+OBm+WFiOOCkumZpOWkllxuICAgICAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0UGVlcihrLnN0YXRlLmZpbmROb2RlLCB7XG4gICAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGUtciBrZWVwIGZpbmQgbm9kZVwiLCBrLnN0YXRlLmZpbmROb2RlKTtcbiAgICAgICAgICAvL+WGjeaOoue0olxuICAgICAgICAgIGsuZmluZE5vZGUoay5zdGF0ZS5maW5kTm9kZSwgY2xvc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHBsYXlPZmZlclF1ZXVlKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vZmZlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgam9iID0gdGhpcy5vZmZlclF1ZXVlWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRvIGpvYlwiLCB7IGpvYiB9LCB0aGlzLm9mZmVyUXVldWUpO1xuICAgICAgICBhd2FpdCBqb2IoKTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc3BvbnNlKHJwYzogc3RyaW5nLCByZXE6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIHJwY1wiLCBycGMsIHJlcSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKHJlc3BvbmRlcikuaW5jbHVkZXMocnBjKSkge1xuICAgICAgcmVzcG9uZGVyW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==