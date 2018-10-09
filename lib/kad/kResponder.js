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

        var _ = k.f.getPeerFromnodeId(network.nodeId);

        if (_) _.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, {
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
        console.log(_KConst.default.FINDVALUE_R, "re find"); //発見できていなければ候補に対して再探索

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsImRlZiIsIlNUT1JFIiwibmV0d29yayIsImNvbnNvbGUiLCJsb2ciLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImtleSIsImNsb3NlIiwiZiIsImdldENsb3NlRXN0RGlzdCIsInN0b3JlIiwic2VuZGVyIiwidmFsdWUiLCJrZXlWYWx1ZUxpc3QiLCJ0b1N0cmluZyIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImZpbmQiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJfIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJvbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwic2VuZERhdGEiLCJQT05HIiwiX29uUGluZyIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsIkZJTkROT0RFX1IiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwib25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsInJwYyIsInJlcSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZCOztJQUVxQkMsVTs7O0FBQ25CLHNCQUFZQyxHQUFaLEVBQTJCO0FBQUE7O0FBQ3pCLFFBQU1DLENBQUMsR0FBR0QsR0FBVjs7QUFFQUYsSUFBQUEsU0FBUyxDQUFDSSxnQkFB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Q0ErQnRCOztBQUNBNUQsZ0JBQUFBLENBQUMsQ0FBQzRELFFBQUYsQ0FBVzVELENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBbkIsRUFBNkJsRCxLQUE3Qjs7QUFoQ3NCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTVCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBb0NEOzs7OzZCQUVRc0QsRyxFQUFhQyxHLEVBQVU7QUFDOUI3RCxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCMkQsR0FBdkIsRUFBNEJDLEdBQTVCOztBQUNBLFVBQUlwQyxNQUFNLENBQUNDLElBQVAsQ0FBWWpDLFNBQVosRUFBdUJrQyxRQUF2QixDQUFnQ2lDLEdBQWhDLENBQUosRUFBMEM7QUFDeENuRSxRQUFBQSxTQUFTLENBQUNtRSxHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy/lj5fjgZHlj5bjgotcbiAgICAgICAgay5rZXlWYWx1ZUxpc3Rbc2hhMShkYXRhLnZhbHVlKS50b1N0cmluZygpXSA9IGRhdGEudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuXG4gICAgICBpZiAoZGF0YS5rZXkgPT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcblxuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8v44Kt44O844KS6KaL44Gk44GL44Gj44Gf44Go44GE44GG44Oh44OD44K744O844K444KS5oi744GZXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICBmaW5kOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgXCJrYWRcIlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdDtcbiAgICAgICAgY29uc3QgXyA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGlmIChfKVxuICAgICAgICAgIF8uc2VuZChcbiAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgICBmaW5kOiBmYWxzZSxcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5maW5kKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLm9uRmluZFZhbHVlKGRhdGEudmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnRvID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuRklORFZBTFVFX1IsIFwicmUgZmluZFwiKTtcbiAgICAgICAgLy/nmbropovjgafjgY3jgabjgYTjgarjgZHjgozjgbDlgJnoo5zjgavlr77jgZfjgablho3mjqLntKJcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlBJTkddID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLnRhcmdldCA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHJlY2VpdmVkXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GL44KJ44OU44Ki44KS5Y+W5b6XXG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogbmV0d29yay5ub2RlSWQgfTtcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5QT05HLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlBPTkddID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLnRhcmdldCA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwb25nIHJlY2VpdmVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy9waW5n44Gu44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGsuY2FsbGJhY2suX29uUGluZ1tuZXR3b3JrLm5vZGVJZF0oKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+imgeaxguOBleOCjOOBn+OCreODvOOBq+i/keOBhOikh+aVsOOBruOCreODvOOCkumAgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IGNsb3NlSURzOiBrLmYuZ2V0Q2xvc2VJRHMoZGF0YS50YXJnZXRLZXkpIH07XG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIik7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIC8v6Z2e5ZCM5pyf44KS44G+44Go44KB44Gm44KE44KLXG4gICAgICBQcm9taXNlLmFsbChcbiAgICAgICAgaWRzLm1hcChhc3luYyAodGFyZ2V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgICAgay5jYWxsYmFjay5vbkZpbmROb2RlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=