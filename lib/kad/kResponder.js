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
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, JSON.stringify(sendData)), "kad");
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

          _peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, JSON.stringify(_sendData)), "kad");
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
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.PONG, JSON.stringify(sendData)), "kad");
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

        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDNODE_R, JSON.stringify(sendData)), "kad");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImtleVZhbHVlTGlzdCIsImNhbGxiYWNrIiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwic3VjY2VzcyIsInNlbmQiLCJGSU5EVkFMVUVfUiIsIkpTT04iLCJzdHJpbmdpZnkiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwib25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiUElORyIsIlBPTkciLCJfb25QaW5nIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsInB1c2giLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJvbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwibGVuZ3RoIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQWMs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QUNBLFVBQUk1QyxNQUFNLENBQUNDLElBQVAsQ0FBWW5DLFNBQVosRUFBdUJvQyxRQUF2QixDQUFnQ3lDLEdBQWhDLENBQUosRUFBMEM7QUFDeEM3RSxRQUFBQSxTQUFTLENBQUM2RSxHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy/lj5fjgZHlj5bjgotcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgay5jYWxsYmFjay5vblN0b3JlKGsua2V5VmFsdWVMaXN0KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICBzdWNjZXNzOiB7IHZhbHVlLCBrZXk6IGRhdGEudGFyZ2V0S2V5IH1cbiAgICAgICAgfTtcbiAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEpKSxcbiAgICAgICAgICBcImthZFwiXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0KGRhdGEudGFyZ2V0S2V5KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICAgIGZhaWw6IHtcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIEpTT04uc3RyaW5naWZ5KHNlbmREYXRhKSksXG4gICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLm9uRmluZFZhbHVlKGRhdGEuc3VjY2Vzcy52YWx1ZSk7XG4gICAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuc3VjY2Vzcy5rZXldID0gZGF0YS5zdWNjZXNzLnZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmZhaWwgJiYgZGF0YS5mYWlsLnRvID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuRklORFZBTFVFX1IsIFwicmUgZmluZFwiLCBkYXRhKTtcbiAgICAgICAgLy/nmbropovjgafjgY3jgabjgYTjgarjgZHjgozjgbDlgJnoo5zjgavlr77jgZfjgablho3mjqLntKJcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5mYWlsLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS5mYWlsLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QSU5HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyByZWNlaXZlZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBi+OCieODlOOCouOCkuWPluW+l1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IG5ldHdvcmsubm9kZUlkIH07XG4gICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuUE9ORywgSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEpKSxcbiAgICAgICAgICBcImthZFwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUE9OR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvbmcgcmVjZWl2ZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL3Bpbmfjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgay5jYWxsYmFjay5fb25QaW5nW25ldHdvcmsubm9kZUlkXSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEpKSxcbiAgICAgICAgICBcImthZFwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgaW4gaWRzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGlkc1trZXldO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvZmZlcnF1ZSBydW5cIiwgdGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgaPjgZ/jgonjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19