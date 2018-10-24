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

                  k.store(data.sender, data.key, data.value); //レプリケーション

                  k.keyValueList[(0, _sha.default)(data.value).toString()] = data.value;
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
        k.callback.onFindValue(data.value); //レプリケーション

        k.keyValueList[(0, _sha.default)(data.value).toString()] = data.value;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImtleVZhbHVlTGlzdCIsInRvU3RyaW5nIiwiY2FsbGJhY2siLCJvblN0b3JlIiwidGFyZ2V0IiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwiZmluZCIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsInRhcmdldE5vZGUiLCJ0byIsIm9uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIlBJTkciLCJzZW5kRGF0YSIsIlBPTkciLCJfb25QaW5nIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsInB1c2giLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJvbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwibGVuZ3RoIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZC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LGdCQUFBQSxDQUFDLENBQUM4RCxRQUFGLENBQVc5RCxDQUFDLENBQUM2RCxLQUFGLENBQVFDLFFBQW5CLEVBQTZCbkQsS0FBN0I7O0FBakNzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXFDRDs7Ozs7Ozs7Ozs7OztxQkFHUSxJOzs7OztzQkFDRCxLQUFLK0MsVUFBTCxDQUFnQlEsTUFBaEIsR0FBeUIsQzs7Ozs7QUFDckJDLGdCQUFBQSxHLEdBQU0sS0FBS1QsVUFBTCxDQUFnQixDQUFoQixDO0FBQ1pyRCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFNkQsa0JBQUFBLEdBQUcsRUFBSEE7QUFBRixpQkFBdEIsRUFBK0IsS0FBS1QsVUFBcEM7O3VCQUNNUyxHQUFHLEU7OztBQUNULHFCQUFLVCxVQUFMLENBQWdCVSxLQUFoQjs7Ozs7O3VCQUVNLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxDQUFDO0FBQUEseUJBQUlDLFVBQVUsQ0FBQ0QsQ0FBRCxFQUFJLElBQUosQ0FBZDtBQUFBLGlCQUFiLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQUtIRSxHLEVBQWFDLEcsRUFBVTtBQUM5QnBFLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJrRSxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSXpDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZcEMsU0FBWixFQUF1QnFDLFFBQXZCLENBQWdDc0MsR0FBaEMsQ0FBSixFQUEwQztBQUN4QzNFLFFBQUFBLFNBQVMsQ0FBQzJFLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3Rbc2hhMShkYXRhLnZhbHVlKS50b1N0cmluZygpXSA9IGRhdGEudmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy/lj5fjgZHlj5bjgotcbiAgICAgICAgay5rZXlWYWx1ZUxpc3Rbc2hhMShkYXRhLnZhbHVlKS50b1N0cmluZygpXSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGsuY2FsbGJhY2sub25TdG9yZShrLmtleVZhbHVlTGlzdCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuXG4gICAgICBpZiAoZGF0YS5rZXkgPT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcblxuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgZmluZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3Q7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKVxuICAgICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgICBmaW5kOiBmYWxzZSxcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5maW5kKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLm9uRmluZFZhbHVlKGRhdGEudmFsdWUpO1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtzaGExKGRhdGEudmFsdWUpLnRvU3RyaW5nKCldID0gZGF0YS52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QSU5HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyByZWNlaXZlZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBi+OCieODlOOCouOCkuWPluW+l1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IG5ldHdvcmsubm9kZUlkIH07XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuUE9ORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QT05HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9uZyByZWNlaXZlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8vcGluZ+OBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBrLmNhbGxiYWNrLl9vblBpbmdbbmV0d29yay5ub2RlSWRdKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLm9uRmluZE5vZGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+WIneacn+WLleS9nOOBrmZpbmRub2Rl44Gn44Gq44GR44KM44GwXG4gICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSAhPT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJub3QgZm91bmRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgonjgarjgZHjgozjgbBcbiAgICAgICAgaWYgKCFpZHMuaW5jbHVkZXMoay5zdGF0ZS5maW5kTm9kZSkpIHtcbiAgICAgICAgICAvL+WVj+OBhOWQiOOCj+OBm+WFiOOCkumZpOWkllxuICAgICAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0UGVlcihrLnN0YXRlLmZpbmROb2RlLCB7XG4gICAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGUtciBrZWVwIGZpbmQgbm9kZVwiLCBrLnN0YXRlLmZpbmROb2RlKTtcbiAgICAgICAgICAvL+WGjeaOoue0olxuICAgICAgICAgIGsuZmluZE5vZGUoay5zdGF0ZS5maW5kTm9kZSwgY2xvc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHBsYXlPZmZlclF1ZXVlKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vZmZlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgam9iID0gdGhpcy5vZmZlclF1ZXVlWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRvIGpvYlwiLCB7IGpvYiB9LCB0aGlzLm9mZmVyUXVldWUpO1xuICAgICAgICBhd2FpdCBqb2IoKTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc3BvbnNlKHJwYzogc3RyaW5nLCByZXE6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIHJwY1wiLCBycGMsIHJlcSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKHJlc3BvbmRlcikuaW5jbHVkZXMocnBjKSkge1xuICAgICAgcmVzcG9uZGVyW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==