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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsImRlZiIsIlNUT1JFIiwibmV0d29yayIsImNvbnNvbGUiLCJsb2ciLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImtleSIsImNsb3NlIiwiZiIsImdldENsb3NlRXN0RGlzdCIsInN0b3JlIiwic2VuZGVyIiwidmFsdWUiLCJrZXlWYWx1ZUxpc3QiLCJ0b1N0cmluZyIsImNhbGxiYWNrIiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImZpbmQiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJfIiwidGFyZ2V0Tm9kZSIsInRvIiwib25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiUElORyIsInNlbmREYXRhIiwiUE9ORyIsIl9vblBpbmciLCJGSU5ETk9ERSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJGSU5ETk9ERV9SIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIm9uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQWMsR0FBRyxFQUF2Qjs7SUFFcUJDLFU7OztBQUNuQixzQkFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUN6QixRQUFNQyxDQUFDLEdBQUdELEdBQVY7O0FBRUFGLElBQUFBLFNBQVMs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O0FBQUE7O0FBQUE7QUE4QnRCTixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNMLENBQUMsQ0FBQzRELEtBQUYsQ0FBUUMsUUFBakQsRUE5QnNCLENBK0J0Qjs7QUFDQTdELGdCQUFBQSxDQUFDLENBQUM2RCxRQUFGLENBQVc3RCxDQUFDLENBQUM0RCxLQUFGLENBQVFDLFFBQW5CLEVBQTZCbkQsS0FBN0I7O0FBaENzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9DRDs7Ozs2QkFFUXVELEcsRUFBYUMsRyxFQUFVO0FBQzlCOUQsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QjRELEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJbkMsTUFBTSxDQUFDQyxJQUFQLENBQVluQyxTQUFaLEVBQXVCb0MsUUFBdkIsQ0FBZ0NnQyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDcEUsUUFBQUEsU0FBUyxDQUFDb0UsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4va2FkZW1saWFcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuXG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/oh6rliIbjgajpgIHkv6HlhYPjga7ot53pm6JcbiAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgLy/oh6rliIbjga5rYnVja2V0c+S4reOBp+mAgeS/oeWFg+OBq+S4gOeVqui/keOBhOi3nembolxuICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8vc3RvcmXjgZfnm7TjgZlcbiAgICAgICAgay5zdG9yZShkYXRhLnNlbmRlciwgZGF0YS5rZXksIGRhdGEudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8v5Y+X44GR5Y+W44KLXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W3NoYTEoZGF0YS52YWx1ZSkudG9TdHJpbmcoKV0gPSBkYXRhLnZhbHVlO1xuICAgICAgICBrLmNhbGxiYWNrLm9uU3RvcmUoay5rZXlWYWx1ZUxpc3QpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcblxuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG5cbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgZmluZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3Q7XG4gICAgICAgIGNvbnN0IF8gPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBpZiAoXylcbiAgICAgICAgICBfLnNlbmQoXG4gICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHtcbiAgICAgICAgICAgICAgZmluZDogZmFsc2UsXG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuZmluZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5vbkZpbmRWYWx1ZShkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QSU5HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyByZWNlaXZlZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBi+OCieODlOOCouOCkuWPluW+l1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IG5ldHdvcmsubm9kZUlkIH07XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuUE9ORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5QT05HXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS50YXJnZXQgPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9uZyByZWNlaXZlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIC8vcGluZ+OBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBrLmNhbGxiYWNrLl9vblBpbmdbbmV0d29yay5ub2RlSWRdKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICAvL+mdnuWQjOacn+OCkuOBvuOBqOOCgeOBpuOChOOCi1xuICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgIGlkcy5tYXAoYXN5bmMgKHRhcmdldDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19