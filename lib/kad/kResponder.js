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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsImRlZiIsIlNUT1JFIiwibmV0d29yayIsImNvbnNvbGUiLCJsb2ciLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImtleSIsImNsb3NlIiwiZiIsImdldENsb3NlRXN0RGlzdCIsInN0b3JlIiwic2VuZGVyIiwidmFsdWUiLCJrZXlWYWx1ZUxpc3QiLCJ0b1N0cmluZyIsImNhbGxiYWNrIiwib25TdG9yZSIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImZpbmQiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJ0YXJnZXROb2RlIiwidG8iLCJvbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwic2VuZERhdGEiLCJQT05HIiwiX29uUGluZyIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsIkZJTkROT0RFX1IiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwib25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsInJwYyIsInJlcSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsU0FBYyxHQUFHLEVBQXZCOztJQUVxQkMsVTs7O0FBQ25CLHNCQUFZQyxHQUFaLEVBQTJCO0FBQUE7O0FBQ3pCLFFBQU1DLENBQUMsR0FBR0QsR0FBVjs7QUFFQUYsSUFBQUEsU0FBUyxDQUFDSSxnQkFBSUMsS0FBTCxDQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBdUIsaUJBQU9DLE9BQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3JCQyxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QkYsT0FBTyxDQUFDRyxNQUFoQztBQUVNQyxnQkFBQUEsSUFIZSxHQUdSSixPQUFPLENBQUNJLElBSEEsRUFJckI7O0FBQ01DLGdCQUFBQSxJQUxlLEdBS1IsMkJBQVNSLENBQUMsQ0FBQ00sTUFBWCxFQUFtQkMsSUFBSSxDQUFDRSxHQUF4QixDQUxRLEVBTXJCOztBQUNNQyxnQkFBQUEsS0FQZSxHQU9QVixDQUFDLENBQUNXLENBQUYsQ0FBSUMsZUFBSixDQUFvQkwsSUFBSSxDQUFDRSxHQUF6QixDQVBPOztBQVFyQixvQkFBSUQsSUFBSSxHQUFHRSxLQUFYLEVBQWtCO0FBQ2hCTixrQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZ0JBQVosRUFBOEIsUUFBOUIsRUFBd0NFLElBQXhDLEVBRGdCLENBRWhCOztBQUNBUCxrQkFBQUEsQ0FBQyxDQUFDYSxLQUFGLENBQVFOLElBQUksQ0FBQ08sTUFBYixFQUFxQlAsSUFBSSxDQUFDRSxHQUExQixFQUErQkYsSUFBSSxDQUFDUSxLQUFwQztBQUNELGlCQUpELE1BSU87QUFDTFgsa0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkJHLElBQTdCLEVBQW1DRSxLQUFuQyxFQUEwQyxRQUExQyxFQUFvREgsSUFBcEQsRUFESyxDQUVMOztBQUNBUCxrQkFBQUEsQ0FBQyxDQUFDZ0IsWUFBRixDQUFlLGtCQUFLVCxJQUFJLENBQUNRLEtBQVYsRUFBaUJFLFFBQWpCLEVBQWYsSUFBOENWLElBQUksQ0FBQ1EsS0FBbkQ7QUFDQWYsa0JBQUFBLENBQUMsQ0FBQ2tCLFFBQUYsQ0FBV0MsT0FBWCxDQUFtQm5CLENBQUMsQ0FBQ2dCLFlBQXJCO0FBQ0Q7O0FBRUtJLGdCQUFBQSxNQW5CZSxHQW1CTmIsSUFBSSxDQUFDTyxNQW5CQzs7QUFBQSxzQkFxQmpCUCxJQUFJLENBQUNFLEdBQUwsS0FBYVQsQ0FBQyxDQUFDTSxNQUFmLElBQXlCLENBQUNOLENBQUMsQ0FBQ1csQ0FBRixDQUFJVSxXQUFKLENBQWdCRCxNQUFoQixDQXJCVDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxxQkFzQmZiLElBQUksQ0FBQ1EsS0FBTCxDQUFXTyxHQXRCSTtBQUFBO0FBQUE7QUFBQTs7QUF1QmpCbEIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGNBQVo7O0FBdkJpQixzQkF5QmJFLElBQUksQ0FBQ1EsS0FBTCxDQUFXTyxHQUFYLENBQWVDLElBQWYsS0FBd0IsT0F6Qlg7QUFBQTtBQUFBO0FBQUE7O0FBMEJmbkIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG9CQUFaLEVBQWtDRSxJQUFJLENBQUNPLE1BQXZDO0FBMUJlO0FBQUEsdUJBMkJUZCxDQUFDLENBQ0p3QixNQURHLENBQ0lKLE1BREosRUFDWWIsSUFBSSxDQUFDUSxLQUFMLENBQVdPLEdBRHZCLEVBQzRCZixJQUFJLENBQUNRLEtBQUwsQ0FBV1UsS0FEdkMsRUFFSEMsS0FGRyxDQUVHdEIsT0FBTyxDQUFDQyxHQUZYLENBM0JTOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQThCVixvQkFBSUUsSUFBSSxDQUFDUSxLQUFMLENBQVdPLEdBQVgsQ0FBZUMsSUFBZixLQUF3QixRQUE1QixFQUFzQztBQUMzQ25CLGtCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxxQkFBWixFQUFtQ0UsSUFBSSxDQUFDTyxNQUF4Qzs7QUFDQSxzQkFBSTtBQUNGZCxvQkFBQUEsQ0FBQyxDQUFDMkIsR0FBRixDQUFNUCxNQUFOLEVBQWNRLFNBQWQsQ0FBd0JyQixJQUFJLENBQUNRLEtBQUwsQ0FBV08sR0FBbkM7QUFDRCxtQkFGRCxDQUVFLE9BQU9PLEtBQVAsRUFBYztBQUNkekIsb0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZd0IsS0FBWjtBQUNEO0FBQ0Y7O0FBckNnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUF2Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUEwQ0FoQyxJQUFBQSxTQUFTLENBQUNJLGdCQUFJNkIsU0FBTCxDQUFULEdBQTJCLFVBQUMzQixPQUFELEVBQWtCO0FBQzNDQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCRixPQUFPLENBQUNHLE1BQXBDO0FBQ0EsVUFBTUMsSUFBSSxHQUFHSixPQUFPLENBQUNJLElBQXJCLENBRjJDLENBRzNDOztBQUNBLFVBQUl3QixNQUFNLENBQUNDLElBQVAsQ0FBWWhDLENBQUMsQ0FBQ2dCLFlBQWQsRUFBNEJpQixRQUE1QixDQUFxQzFCLElBQUksQ0FBQzJCLFNBQTFDLENBQUosRUFBMEQ7QUFDeEQsWUFBTW5CLEtBQUssR0FBR2YsQ0FBQyxDQUFDZ0IsWUFBRixDQUFlVCxJQUFJLENBQUMyQixTQUFwQixDQUFkO0FBQ0EsWUFBTUMsSUFBSSxHQUFHbkMsQ0FBQyxDQUFDVyxDQUFGLENBQUl5QixpQkFBSixDQUFzQmpDLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYixDQUZ3RCxDQUd4RDs7QUFDQSxZQUFJLENBQUM2QixJQUFMLEVBQVc7QUFDWEEsUUFBQUEsSUFBSSxDQUFDRSxJQUFMLENBQ0UsMkJBQWNyQyxDQUFDLENBQUNNLE1BQWhCLEVBQXdCTCxnQkFBSXFDLFdBQTVCLEVBQXlDO0FBQ3ZDQyxVQUFBQSxJQUFJLEVBQUUsSUFEaUM7QUFFdkN4QixVQUFBQSxLQUFLLEVBQUVBO0FBRmdDLFNBQXpDLENBREYsRUFLRSxLQUxGO0FBT0QsT0FaRCxNQVlPO0FBQ0w7QUFDQSxZQUFNeUIsR0FBRyxHQUFHeEMsQ0FBQyxDQUFDVyxDQUFGLENBQUk4QixrQkFBaEI7O0FBQ0EsWUFBTU4sS0FBSSxHQUFHbkMsQ0FBQyxDQUFDVyxDQUFGLENBQUl5QixpQkFBSixDQUFzQmpDLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYjs7QUFDQUYsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQ0UsZUFERixFQUVFLDJCQUFjTCxDQUFDLENBQUNNLE1BQWhCLEVBQXdCTCxnQkFBSXFDLFdBQTVCLEVBQXlDO0FBQ3ZDQyxVQUFBQSxJQUFJLEVBQUUsS0FEaUM7QUFFdkNDLFVBQUFBLEdBQUcsRUFBRUEsR0FGa0M7QUFHdkNFLFVBQUFBLFVBQVUsRUFBRW5DLElBQUksQ0FBQ21DLFVBSHNCO0FBSXZDUixVQUFBQSxTQUFTLEVBQUUzQixJQUFJLENBQUMyQixTQUp1QjtBQUt2Q1MsVUFBQUEsRUFBRSxFQUFFeEMsT0FBTyxDQUFDRztBQUwyQixTQUF6QyxDQUZGO0FBVUEsWUFBSTZCLEtBQUosRUFDRUEsS0FBSSxDQUFDRSxJQUFMLENBQ0UsMkJBQWNyQyxDQUFDLENBQUNNLE1BQWhCLEVBQXdCTCxnQkFBSXFDLFdBQTVCLEVBQXlDO0FBQ3ZDQyxVQUFBQSxJQUFJLEVBQUUsS0FEaUM7QUFFdkNDLFVBQUFBLEdBQUcsRUFBRUEsR0FGa0M7QUFHdkNFLFVBQUFBLFVBQVUsRUFBRW5DLElBQUksQ0FBQ21DLFVBSHNCO0FBSXZDUixVQUFBQSxTQUFTLEVBQUUzQixJQUFJLENBQUMyQixTQUp1QjtBQUt2Q1MsVUFBQUEsRUFBRSxFQUFFeEMsT0FBTyxDQUFDRztBQUwyQixTQUF6QyxDQURGLEVBUUUsS0FSRjtBQVVIO0FBQ0YsS0ExQ0Q7O0FBNENBVCxJQUFBQSxTQUFTLENBQUNJLGdCQUFJcUMsV0FBTCxDQUFULEdBQTZCLFVBQUNuQyxPQUFELEVBQWtCO0FBQzdDLFVBQU1JLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQixDQUQ2QyxDQUU3Qzs7QUFDQSxVQUFJQSxJQUFJLENBQUNnQyxJQUFULEVBQWU7QUFDYm5DLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGlCQUFaO0FBQ0FMLFFBQUFBLENBQUMsQ0FBQ2tCLFFBQUYsQ0FBVzBCLFdBQVgsQ0FBdUJyQyxJQUFJLENBQUNRLEtBQTVCO0FBQ0QsT0FIRCxNQUdPLElBQUlSLElBQUksQ0FBQ29DLEVBQUwsS0FBWTNDLENBQUMsQ0FBQ00sTUFBbEIsRUFBMEI7QUFDL0JGLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSixnQkFBSXFDLFdBQWhCLEVBQTZCLFNBQTdCLEVBQXdDL0IsSUFBeEMsRUFEK0IsQ0FFL0I7O0FBQ0EsYUFBSyxJQUFJc0MsRUFBVCxJQUFldEMsSUFBSSxDQUFDaUMsR0FBcEIsRUFBeUI7QUFDdkIsY0FBTUwsSUFBSSxHQUFHbkMsQ0FBQyxDQUFDVyxDQUFGLENBQUl5QixpQkFBSixDQUFzQlMsRUFBdEIsQ0FBYjtBQUNBLGNBQUksQ0FBQ1YsSUFBTCxFQUFXO0FBQ1huQyxVQUFBQSxDQUFDLENBQUM4QyxXQUFGLENBQWN2QyxJQUFJLENBQUMyQixTQUFuQixFQUE4QkMsSUFBOUI7QUFDRDtBQUNGO0FBQ0YsS0FmRDs7QUFpQkF0QyxJQUFBQSxTQUFTLENBQUNJLGdCQUFJOEMsSUFBTCxDQUFULEdBQXNCLFVBQUM1QyxPQUFELEVBQWtCO0FBQ3RDLFVBQU1JLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQjs7QUFDQSxVQUFJQSxJQUFJLENBQUNhLE1BQUwsS0FBZ0JwQixDQUFDLENBQUNNLE1BQXRCLEVBQThCO0FBQzVCRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBRDRCLENBRTVCOztBQUNBLFlBQU04QixJQUFJLEdBQUduQyxDQUFDLENBQUNXLENBQUYsQ0FBSXlCLGlCQUFKLENBQXNCakMsT0FBTyxDQUFDRyxNQUE5QixDQUFiO0FBQ0EsWUFBSSxDQUFDNkIsSUFBTCxFQUFXO0FBQ1gsWUFBTWEsUUFBUSxHQUFHO0FBQUU1QixVQUFBQSxNQUFNLEVBQUVqQixPQUFPLENBQUNHO0FBQWxCLFNBQWpCO0FBQ0E2QixRQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSwyQkFBY3JDLENBQUMsQ0FBQ00sTUFBaEIsRUFBd0JMLGdCQUFJZ0QsSUFBNUIsRUFBa0NELFFBQWxDLENBQVYsRUFBdUQsS0FBdkQ7QUFDRDtBQUNGLEtBVkQ7O0FBWUFuRCxJQUFBQSxTQUFTLENBQUNJLGdCQUFJZ0QsSUFBTCxDQUFULEdBQXNCLFVBQUM5QyxPQUFELEVBQWtCO0FBQ3RDLFVBQU1JLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQjs7QUFDQSxVQUFJQSxJQUFJLENBQUNhLE1BQUwsS0FBZ0JwQixDQUFDLENBQUNNLE1BQXRCLEVBQThCO0FBQzVCRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCRixPQUFPLENBQUNHLE1BQXJDLEVBRDRCLENBRTVCOztBQUNBTixRQUFBQSxDQUFDLENBQUNrQixRQUFGLENBQVdnQyxPQUFYLENBQW1CL0MsT0FBTyxDQUFDRyxNQUEzQjtBQUNEO0FBQ0YsS0FQRDs7QUFTQVQsSUFBQUEsU0FBUyxDQUFDSSxnQkFBSWtELFFBQUwsQ0FBVCxHQUEwQixVQUFDaEQsT0FBRCxFQUFrQjtBQUMxQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQUEyQkYsT0FBTyxDQUFDRyxNQUFuQztBQUNBLFVBQU1DLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQixDQUYwQyxDQUcxQzs7QUFDQSxVQUFNeUMsUUFBUSxHQUFHO0FBQUVJLFFBQUFBLFFBQVEsRUFBRXBELENBQUMsQ0FBQ1csQ0FBRixDQUFJMEMsV0FBSixDQUFnQjlDLElBQUksQ0FBQzJCLFNBQXJCO0FBQVosT0FBakI7QUFDQSxVQUFNQyxJQUFJLEdBQUduQyxDQUFDLENBQUNXLENBQUYsQ0FBSXlCLGlCQUFKLENBQXNCakMsT0FBTyxDQUFDRyxNQUE5QixDQUFiOztBQUNBLFVBQUk2QixJQUFKLEVBQVU7QUFDUi9CLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG1CQUFaLEVBQWlDMkMsUUFBUSxDQUFDSSxRQUExQyxFQURRLENBRVI7O0FBQ0FqQixRQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSwyQkFBY3JDLENBQUMsQ0FBQ00sTUFBaEIsRUFBd0JMLGdCQUFJcUQsVUFBNUIsRUFBd0NOLFFBQXhDLENBQVYsRUFBNkQsS0FBN0Q7QUFDRDtBQUNGLEtBWEQ7O0FBYUFuRCxJQUFBQSxTQUFTLENBQUNJLGdCQUFJcUQsVUFBTCxDQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBNEIsa0JBQU9uRCxPQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNwQkksZ0JBQUFBLElBRG9CLEdBQ2JKLE9BQU8sQ0FBQ0ksSUFESyxFQUUxQjs7QUFDTWlDLGdCQUFBQSxHQUhvQixHQUdkakMsSUFBSSxDQUFDNkMsUUFIUztBQUkxQmhELGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCbUMsR0FBN0IsRUFKMEIsQ0FNMUI7O0FBQ0FlLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FDRWhCLEdBQUcsQ0FBQ2lCLEdBQUo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDBDQUFRLGtCQUFPckMsTUFBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0NBQ0ZBLE1BQU0sS0FBS3BCLENBQUMsQ0FBQ00sTUFBYixJQUF1QixDQUFDTixDQUFDLENBQUNXLENBQUYsQ0FBSVUsV0FBSixDQUFnQkQsTUFBaEIsQ0FEdEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxtQ0FHRXBCLENBQUMsQ0FBQzBELEtBQUYsQ0FBUXRDLE1BQVIsRUFBZ0JqQixPQUFPLENBQUNHLE1BQXhCLEVBQWdDb0IsS0FBaEMsQ0FBc0N0QixPQUFPLENBQUNDLEdBQTlDLENBSEY7O0FBQUE7QUFLTjtBQUNBLGdDQUFJTCxDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQVIsS0FBcUJ4QyxNQUF6QixFQUFpQztBQUMvQnBCLDhCQUFBQSxDQUFDLENBQUNrQixRQUFGLENBQVcyQyxVQUFYO0FBQ0Q7O0FBUks7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQVI7O0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBREYsRUFQMEIsQ0FvQjFCOztBQXBCMEIsc0JBcUJ0QjdELENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBUixLQUFxQjVELENBQUMsQ0FBQ00sTUFyQkQ7QUFBQTtBQUFBO0FBQUE7O0FBc0J4QkYsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFdBQVosRUF0QndCLENBdUJ4Qjs7QUF2QndCLG9CQXdCbkJtQyxHQUFHLENBQUNQLFFBQUosQ0FBYWpDLENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBckIsQ0F4Qm1CO0FBQUE7QUFBQTtBQUFBOztBQXlCdEI7QUFDTWxELGdCQUFBQSxLQTFCZ0IsR0EwQlJWLENBQUMsQ0FBQ1csQ0FBRixDQUFJbUQsZUFBSixDQUFvQjlELENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBNUIsRUFBc0M7QUFDbERHLGtCQUFBQSxTQUFTLEVBQUU1RCxPQUFPLENBQUNHO0FBRCtCLGlCQUF0QyxDQTFCUTs7QUFBQSxvQkE2QmpCSSxLQTdCaUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUE4QnRCTixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNMLENBQUMsQ0FBQzJELEtBQUYsQ0FBUUMsUUFBakQsRUE5QnNCLENBK0J0Qjs7QUFDQTVELGdCQUFBQSxDQUFDLENBQUM0RCxRQUFGLENBQVc1RCxDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQW5CLEVBQTZCbEQsS0FBN0I7O0FBaENzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9DRDs7Ozs2QkFFUXNELEcsRUFBYUMsRyxFQUFVO0FBQzlCN0QsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QjJELEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJbEMsTUFBTSxDQUFDQyxJQUFQLENBQVluQyxTQUFaLEVBQXVCb0MsUUFBdkIsQ0FBZ0MrQixHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDbkUsUUFBQUEsU0FBUyxDQUFDbUUsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4va2FkZW1saWFcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuXG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/oh6rliIbjgajpgIHkv6HlhYPjga7ot53pm6JcbiAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgLy/oh6rliIbjga5rYnVja2V0c+S4reOBp+mAgeS/oeWFg+OBq+S4gOeVqui/keOBhOi3nembolxuICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8vc3RvcmXjgZfnm7TjgZlcbiAgICAgICAgay5zdG9yZShkYXRhLnNlbmRlciwgZGF0YS5rZXksIGRhdGEudmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8v5Y+X44GR5Y+W44KLXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W3NoYTEoZGF0YS52YWx1ZSkudG9TdHJpbmcoKV0gPSBkYXRhLnZhbHVlO1xuICAgICAgICBrLmNhbGxiYWNrLm9uU3RvcmUoay5rZXlWYWx1ZUxpc3QpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcblxuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG5cbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL+OCreODvOOCkuimi+OBpOOBi+OBo+OBn+OBqOOBhOOBhuODoeODg+OCu+ODvOOCuOOCkuaIu+OBmVxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwge1xuICAgICAgICAgICAgZmluZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3Q7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcInJlIHNlbmQgdmFsdWVcIixcbiAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHtcbiAgICAgICAgICAgIGZpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHBlZXIpXG4gICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICAgIGZpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLmZpbmQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2sub25GaW5kVmFsdWUoZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUElOR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgcmVjZWl2ZWRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYvjgonjg5TjgqLjgpLlj5blvpdcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBuZXR3b3JrLm5vZGVJZCB9O1xuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLlBPTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUE9OR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvbmcgcmVjZWl2ZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL3Bpbmfjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgay5jYWxsYmFjay5fb25QaW5nW25ldHdvcmsubm9kZUlkXSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIC8v6Z2e5ZCM5pyf44KS44G+44Go44KB44Gm44KE44KLXG4gICAgICBQcm9taXNlLmFsbChcbiAgICAgICAgaWRzLm1hcChhc3luYyAodGFyZ2V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgICAgay5jYWxsYmFjay5vbkZpbmROb2RlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=