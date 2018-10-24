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

        console.log("re send value");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImtleVZhbHVlTGlzdCIsInRvU3RyaW5nIiwiY2FsbGJhY2siLCJvblN0b3JlIiwidGFyZ2V0IiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwiZmluZCIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsInRhcmdldE5vZGUiLCJ0byIsIm9uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIlBJTkciLCJzZW5kRGF0YSIsIlBPTkciLCJfb25QaW5nIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsInB1c2giLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJvbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwibGVuZ3RoIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZC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LEdBQU0sS0FBS1QsVUFBTCxDQUFnQixDQUFoQixDO0FBQ1pyRCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFNkQsa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1QsVUFBcEM7O3VCQUNNUyxHQUFHLEU7OztBQUNULHFCQUFLVCxVQUFMLENBQWdCVSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QnBFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJrRSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSXpDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZcEMsU0FBWixFQUF1QnFDLFFBQXZCLENBQWdDc0MsR0FBaEMsQ0FBSixFQUEwQztBQUN4QzNFLFFBQUFBLFNBQVMsQ0FBQzJFLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL+WPl+OBkeWPluOCi1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtzaGExKGRhdGEudmFsdWUpLnRvU3RyaW5nKCldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgay5jYWxsYmFjay5vblN0b3JlKGsua2V5VmFsdWVMaXN0KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICBmaW5kOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgXCJrYWRcIlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdDtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpXG4gICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICAgIGZpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLmZpbmQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2sub25GaW5kVmFsdWUoZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUElOR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgcmVjZWl2ZWRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYvjgonjg5TjgqLjgpLlj5blvpdcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBuZXR3b3JrLm5vZGVJZCB9O1xuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLlBPTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUE9OR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvbmcgcmVjZWl2ZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL3Bpbmfjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgay5jYWxsYmFjay5fb25QaW5nW25ldHdvcmsubm9kZUlkXSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQseyBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLCBpZHM6IHNlbmREYXRhLmNsb3NlSURzIH0pO1xuICAgICAgXG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIiwgc2VuZERhdGEuY2xvc2VJRHMpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgaW4gaWRzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGlkc1trZXldO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvZmZlcnF1ZSBydW5cIiwgdGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgaPjgZ/jgonjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19