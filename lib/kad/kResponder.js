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

var responder = {};

var KResponder =
/*#__PURE__*/
function () {
  function KResponder(kad) {
    _classCallCheck(this, KResponder);

    var k = kad;

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
        console.log("sendback findnode"); //送り返す

        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDNODE_R, sendData), "kad");
      }
    };

    responder[_KConst.default.FINDNODE_R] =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(network) {
        var data, ids, close;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids); //非同期をまとめてやる

                Promise.all(ids.map(
                /*#__PURE__*/
                function () {
                  var _ref3 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2(target) {
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
                            //ノードIDが見つかったらコールバック
                            if (k.state.findNode === target) {
                              k.callback.onFindNode();
                            }

                          case 4:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));

                  return function (_x3) {
                    return _ref3.apply(this, arguments);
                  };
                }())); //初期動作のfindnodeでなければ

                if (!(k.state.findNode !== k.nodeId)) {
                  _context3.next = 12;
                  break;
                }

                console.log("not found"); //ノードIDが見つからなければ

                if (ids.includes(k.state.findNode)) {
                  _context3.next = 12;
                  break;
                }

                //問い合わせ先を除外
                close = k.f.getCloseEstPeer(k.state.findNode, {
                  excludeId: network.nodeId
                });

                if (close) {
                  _context3.next = 10;
                  break;
                }

                return _context3.abrupt("return");

              case 10:
                console.log("findnode-r keep find node", k.state.findNode); //再探索

                k.findNode(k.state.findNode, close);

              case 12:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsImRlZiIsIlNUT1JFIiwibmV0d29yayIsImNvbnNvbGUiLCJsb2ciLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImtleSIsImNsb3NlIiwiZiIsImdldENsb3NlRXN0RGlzdCIsInN0b3JlIiwic2VuZGVyIiwidmFsdWUiLCJrZXlWYWx1ZUxpc3QiLCJ0b1N0cmluZyIsImNhbGxiYWNrIiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImZpbmQiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJ0YXJnZXROb2RlIiwidG8iLCJvbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwic2VuZERhdGEiLCJQT05HIiwiX29uUGluZyIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsIkZJTkROT0RFX1IiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwib25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsInJwYyIsInJlcSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZCOztJQUVxQkMsVTs7O0FBQ25CLHNCQUFZQyxHQUFaLEVBQTJCO0FBQUE7O0FBQ3pCLFFBQU1DLENBQUMsR0FBR0QsR0FBVjs7QUFFQUYsSUFBQUEsU0FBUyxDQUFD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d0Isb0JBd0JuQm1DLEdBQUcsQ0FBQ1AsUUFBSixDQUFhakMsQ0FBQyxDQUFDMkQsS0FBRixDQUFRQyxRQUFyQixDQXhCbUI7QUFBQTtBQUFBO0FBQUE7O0FBeUJ0QjtBQUNNbEQsZ0JBQUFBLEtBMUJnQixHQTBCUlYsQ0FBQyxDQUFDVyxDQUFGLENBQUltRCxlQUFKLENBQW9COUQsQ0FBQyxDQUFDMkQsS0FBRixDQUFRQyxRQUE1QixFQUFzQztBQUNsREcsa0JBQUFBLFNBQVMsRUFBRTVELE9BQU8sQ0FBQ0c7QUFEK0IsaUJBQXRDLENBMUJROztBQUFBLG9CQTZCakJJLEtBN0JpQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQThCdEJOLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSwyQkFBWixFQUF5Q0wsQ0FBQyxDQUFDMkQsS0FBRixDQUFRQyxRQUFqRCxFQTlCc0IsQ0ErQnRCOztBQUNBNUQsZ0JBQUFBLENBQUMsQ0FBQzRELFFBQUYsQ0FBVzVELENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBbkIsRUFBNkJsRCxLQUE3Qjs7QUFoQ3NCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTVCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBb0NEOzs7OzZCQUVRc0QsRyxFQUFhQyxHLEVBQVU7QUFDOUI3RCxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCMkQsR0FBdkIsRUFBNEJDLEdBQTVCOztBQUNBLFVBQUlsQyxNQUFNLENBQUNDLElBQVAsQ0FBWW5DLFNBQVosRUFBdUJvQyxRQUF2QixDQUFnQytCLEdBQWhDLENBQUosRUFBMEM7QUFDeENuRSxRQUFBQSxTQUFTLENBQUNtRSxHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy/lj5fjgZHlj5bjgotcbiAgICAgICAgay5rZXlWYWx1ZUxpc3Rbc2hhMShkYXRhLnZhbHVlKS50b1N0cmluZygpXSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGsuY2FsbGJhY2sub25TdG9yZShrLmtleVZhbHVlTGlzdCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuXG4gICAgICBpZiAoZGF0YS5rZXkgPT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcblxuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICBmaW5kOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgXCJrYWRcIlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdDtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwicmUgc2VuZCB2YWx1ZVwiLFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgZmluZDogZmFsc2UsXG4gICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICBpZiAocGVlcilcbiAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHtcbiAgICAgICAgICAgICAgZmluZDogZmFsc2UsXG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuZmluZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5vbkZpbmRWYWx1ZShkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QSU5HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyByZWNlaXZlZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBi+OCieODlOOCouOCkuWPluW+l1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IG5ldHdvcmsubm9kZUlkIH07XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuUE9ORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QT05HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9uZyByZWNlaXZlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8vcGluZ+OBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBrLmNhbGxiYWNrLl9vblBpbmdbbmV0d29yay5ub2RlSWRdKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICAvL+mdnuWQjOacn+OCkuOBvuOBqOOCgeOBpuOChOOCi1xuICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgIGlkcy5tYXAoYXN5bmMgKHRhcmdldDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19