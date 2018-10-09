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

        k.callback.onPing[network.nodeId]();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsImRlZiIsIlNUT1JFIiwibmV0d29yayIsImNvbnNvbGUiLCJsb2ciLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImtleSIsImNsb3NlIiwiZiIsImdldENsb3NlRXN0RGlzdCIsInN0b3JlIiwic2VuZGVyIiwidmFsdWUiLCJrZXlWYWx1ZUxpc3QiLCJ0b1N0cmluZyIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwiY2F0Y2giLCJyZWYiLCJzZXRBbnN3ZXIiLCJlcnJvciIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsImZpbmQiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJfIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJvbkZpbmRWYWx1ZSIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwic2VuZERhdGEiLCJQT05HIiwib25QaW5nIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiRklORE5PREVfUiIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJvbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZXhjbHVkZUlkIiwicnBjIiwicmVxIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxTQUFjLEdBQUcsRUFBdkI7O0lBRXFCQyxVOzs7QUFDbkIsc0JBQVlDLEdBQVosRUFBMkI7QUFBQTs7QUFDekIsUUFBTUMsQ0FBQyxHQUFHRCxHQUFWOztBQUVBRixJQUFBQSxTQUFTLENBQUNJLGdCQUFJQyxLQUFMLENBQVQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDhCQUF1QixpQkFBT0MsT0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDckJDLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCRixPQUFPLENBQUNHLE1BQWhDO0FBRU1DLGdCQUFBQSxJQUhlLEdBR1JKLE9BQU8sQ0FBQ0ksSUFIQSxFQUlyQjs7QUFDTUMsZ0JBQUFBLElBTGUsR0FLUiwyQkFBU1IsQ0FBQyxDQUFDTSxNQUFYLEVBQW1CQyxJQUFJLENBQUNFLEdBQXhCLENBTFEsRUFNckI7O0FBQ01DLGdCQUFBQSxLQVBlLEdBT1BWLENBQUMsQ0FBQ1csQ0FBRixDQUFJQyxlQUFKLENBQW9CTCxJQUFJLENBQUNFLEdBQXpCLENBUE87O0FBUXJCLG9CQUFJRCxJQUFJLEdBQUdFLEtBQVgsRUFBa0I7QUFDaEJOLGtCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixRQUE5QixFQUF3Q0UsSUFBeEMsRUFEZ0IsQ0FFaEI7O0FBQ0FQLGtCQUFBQSxDQUFDLENBQUNhLEtBQUYsQ0FBUU4sSUFBSSxDQUFDTyxNQUFiLEVBQXFCUCxJQUFJLENBQUNFLEdBQTFCLEVBQStCRixJQUFJLENBQUNRLEtBQXBDO0FBQ0QsaUJBSkQsTUFJTztBQUNMWCxrQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QkcsSUFBN0IsRUFBbUNFLEtBQW5DLEVBQTBDLFFBQTFDLEVBQW9ESCxJQUFwRCxFQURLLENBRUw7O0FBQ0FQLGtCQUFBQSxDQUFDLENBQUNnQixZQUFGLENBQWUsa0JBQUtULElBQUksQ0FBQ1EsS0FBVixFQUFpQkUsUUFBakIsRUFBZixJQUE4Q1YsSUFBSSxDQUFDUSxLQUFuRDtBQUNEOztBQUVLRyxnQkFBQUEsTUFsQmUsR0FrQk5YLElBQUksQ0FBQ08sTUFsQkM7O0FBQUEsc0JBb0JqQlAsSUFBSSxDQUFDRSxHQUFMLEtBQWFULENBQUMsQ0FBQ00sTUFBZixJQUF5QixDQUFDTixDQUFDLENBQUNXLENBQUYsQ0FBSVEsV0FBSixDQUFnQkQsTUFBaEIsQ0FwQlQ7QUFBQTtBQUFBO0FBQUE7O0FBQUEscUJBcUJmWCxJQUFJLENBQUNRLEtBQUwsQ0FBV0ssR0FyQkk7QUFBQTtBQUFBO0FBQUE7O0FBc0JqQmhCLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaOztBQXRCaUIsc0JBd0JiRSxJQUFJLENBQUNRLEtBQUwsQ0FBV0ssR0FBWCxDQUFlQyxJQUFmLEtBQXdCLE9BeEJYO0FBQUE7QUFBQTtBQUFBOztBQXlCZmpCLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQ0UsSUFBSSxDQUFDTyxNQUF2QztBQXpCZTtBQUFBLHVCQTBCVGQsQ0FBQyxDQUNKc0IsTUFERyxDQUNJSixNQURKLEVBQ1lYLElBQUksQ0FBQ1EsS0FBTCxDQUFXSyxHQUR2QixFQUM0QmIsSUFBSSxDQUFDUSxLQUFMLENBQVdRLEtBRHZDLEVBRUhDLEtBRkcsQ0FFR3BCLE9BQU8sQ0FBQ0MsR0FGWCxDQTFCUzs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUE2QlYsb0JBQUlFLElBQUksQ0FBQ1EsS0FBTCxDQUFXSyxHQUFYLENBQWVDLElBQWYsS0FBd0IsUUFBNUIsRUFBc0M7QUFDM0NqQixrQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVkscUJBQVosRUFBbUNFLElBQUksQ0FBQ08sTUFBeEM7O0FBQ0Esc0JBQUk7QUFDRmQsb0JBQUFBLENBQUMsQ0FBQ3lCLEdBQUYsQ0FBTVAsTUFBTixFQUFjUSxTQUFkLENBQXdCbkIsSUFBSSxDQUFDUSxLQUFMLENBQVdLLEdBQW5DO0FBQ0QsbUJBRkQsQ0FFRSxPQUFPTyxLQUFQLEVBQWM7QUFDZHZCLG9CQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWXNCLEtBQVo7QUFDRDtBQUNGOztBQXBDZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBdkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBeUNBOUIsSUFBQUEsU0FBUyxDQUFDSSxnQkFBSTJCLFNBQUwsQ0FBVCxHQUEyQixVQUFDekIsT0FBRCxFQUFrQjtBQUMzQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QkYsT0FBTyxDQUFDRyxNQUFwQztBQUNBLFVBQU1DLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQixDQUYyQyxDQUczQzs7QUFDQSxVQUFJc0IsTUFBTSxDQUFDQyxJQUFQLENBQVk5QixDQUFDLENBQUNnQixZQUFkLEVBQTRCZSxRQUE1QixDQUFxQ3hCLElBQUksQ0FBQ3lCLFNBQTFDLENBQUosRUFBMEQ7QUFDeEQsWUFBTWpCLEtBQUssR0FBR2YsQ0FBQyxDQUFDZ0IsWUFBRixDQUFlVCxJQUFJLENBQUN5QixTQUFwQixDQUFkO0FBQ0EsWUFBTUMsSUFBSSxHQUFHakMsQ0FBQyxDQUFDVyxDQUFGLENBQUl1QixpQkFBSixDQUFzQi9CLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYixDQUZ3RCxDQUd4RDs7QUFDQSxZQUFJLENBQUMyQixJQUFMLEVBQVc7QUFDWEEsUUFBQUEsSUFBSSxDQUFDRSxJQUFMLENBQ0UsMkJBQWNuQyxDQUFDLENBQUNNLE1BQWhCLEVBQXdCTCxnQkFBSW1DLFdBQTVCLEVBQXlDO0FBQ3ZDQyxVQUFBQSxJQUFJLEVBQUUsSUFEaUM7QUFFdkN0QixVQUFBQSxLQUFLLEVBQUVBO0FBRmdDLFNBQXpDLENBREYsRUFLRSxLQUxGO0FBT0QsT0FaRCxNQVlPO0FBQ0w7QUFDQSxZQUFNdUIsR0FBRyxHQUFHdEMsQ0FBQyxDQUFDVyxDQUFGLENBQUk0QixrQkFBaEI7O0FBQ0EsWUFBTUMsQ0FBQyxHQUFHeEMsQ0FBQyxDQUFDVyxDQUFGLENBQUl1QixpQkFBSixDQUFzQi9CLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBVjs7QUFDQSxZQUFJa0MsQ0FBSixFQUNFQSxDQUFDLENBQUNMLElBQUYsQ0FDRSwyQkFBY25DLENBQUMsQ0FBQ00sTUFBaEIsRUFBd0JMLGdCQUFJbUMsV0FBNUIsRUFBeUM7QUFDdkNDLFVBQUFBLElBQUksRUFBRSxLQURpQztBQUV2Q0MsVUFBQUEsR0FBRyxFQUFFQSxHQUZrQztBQUd2Q0csVUFBQUEsVUFBVSxFQUFFbEMsSUFBSSxDQUFDa0MsVUFIc0I7QUFJdkNULFVBQUFBLFNBQVMsRUFBRXpCLElBQUksQ0FBQ3lCLFNBSnVCO0FBS3ZDVSxVQUFBQSxFQUFFLEVBQUV2QyxPQUFPLENBQUNHO0FBTDJCLFNBQXpDLENBREYsRUFRRSxLQVJGO0FBVUg7QUFDRixLQWhDRDs7QUFrQ0FULElBQUFBLFNBQVMsQ0FBQ0ksZ0JBQUltQyxXQUFMLENBQVQsR0FBNkIsVUFBQ2pDLE9BQUQsRUFBa0I7QUFDN0MsVUFBTUksSUFBSSxHQUFHSixPQUFPLENBQUNJLElBQXJCLENBRDZDLENBRTdDOztBQUNBLFVBQUlBLElBQUksQ0FBQzhCLElBQVQsRUFBZTtBQUNiakMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVo7QUFDQUwsUUFBQUEsQ0FBQyxDQUFDMkMsUUFBRixDQUFXQyxXQUFYLENBQXVCckMsSUFBSSxDQUFDUSxLQUE1QjtBQUNELE9BSEQsTUFHTyxJQUFJUixJQUFJLENBQUNtQyxFQUFMLEtBQVkxQyxDQUFDLENBQUNNLE1BQWxCLEVBQTBCO0FBQy9CRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWUosZ0JBQUltQyxXQUFoQixFQUE2QixTQUE3QixFQUQrQixDQUUvQjs7QUFDQSxhQUFLLElBQUlTLEVBQVQsSUFBZXRDLElBQUksQ0FBQytCLEdBQXBCLEVBQXlCO0FBQ3ZCLGNBQU1MLElBQUksR0FBR2pDLENBQUMsQ0FBQ1csQ0FBRixDQUFJdUIsaUJBQUosQ0FBc0JXLEVBQXRCLENBQWI7QUFDQSxjQUFJLENBQUNaLElBQUwsRUFBVztBQUNYakMsVUFBQUEsQ0FBQyxDQUFDOEMsV0FBRixDQUFjdkMsSUFBSSxDQUFDeUIsU0FBbkIsRUFBOEJDLElBQTlCO0FBQ0Q7QUFDRjtBQUNGLEtBZkQ7O0FBaUJBcEMsSUFBQUEsU0FBUyxDQUFDSSxnQkFBSThDLElBQUwsQ0FBVCxHQUFzQixVQUFDNUMsT0FBRCxFQUFrQjtBQUN0QyxVQUFNSSxJQUFJLEdBQUdKLE9BQU8sQ0FBQ0ksSUFBckI7O0FBQ0EsVUFBSUEsSUFBSSxDQUFDVyxNQUFMLEtBQWdCbEIsQ0FBQyxDQUFDTSxNQUF0QixFQUE4QjtBQUM1QkYsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUQ0QixDQUU1Qjs7QUFDQSxZQUFNNEIsSUFBSSxHQUFHakMsQ0FBQyxDQUFDVyxDQUFGLENBQUl1QixpQkFBSixDQUFzQi9CLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYjtBQUNBLFlBQUksQ0FBQzJCLElBQUwsRUFBVztBQUNYLFlBQU1lLFFBQVEsR0FBRztBQUFFOUIsVUFBQUEsTUFBTSxFQUFFZixPQUFPLENBQUNHO0FBQWxCLFNBQWpCO0FBQ0EyQixRQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSwyQkFBY25DLENBQUMsQ0FBQ00sTUFBaEIsRUFBd0JMLGdCQUFJZ0QsSUFBNUIsRUFBa0NELFFBQWxDLENBQVYsRUFBdUQsS0FBdkQ7QUFDRDtBQUNGLEtBVkQ7O0FBWUFuRCxJQUFBQSxTQUFTLENBQUNJLGdCQUFJZ0QsSUFBTCxDQUFULEdBQXNCLFVBQUM5QyxPQUFELEVBQWtCO0FBQ3RDLFVBQU1JLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQjs7QUFDQSxVQUFJQSxJQUFJLENBQUNXLE1BQUwsS0FBZ0JsQixDQUFDLENBQUNNLE1BQXRCLEVBQThCO0FBQzVCRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCRixPQUFPLENBQUNHLE1BQXJDLEVBRDRCLENBRTVCOztBQUNBTixRQUFBQSxDQUFDLENBQUMyQyxRQUFGLENBQVdPLE1BQVgsQ0FBa0IvQyxPQUFPLENBQUNHLE1BQTFCO0FBQ0Q7QUFDRixLQVBEOztBQVNBVCxJQUFBQSxTQUFTLENBQUNJLGdCQUFJa0QsUUFBTCxDQUFULEdBQTBCLFVBQUNoRCxPQUFELEVBQWtCO0FBQzFDQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCRixPQUFPLENBQUNHLE1BQW5DO0FBQ0EsVUFBTUMsSUFBSSxHQUFHSixPQUFPLENBQUNJLElBQXJCLENBRjBDLENBRzFDOztBQUNBLFVBQU15QyxRQUFRLEdBQUc7QUFBRUksUUFBQUEsUUFBUSxFQUFFcEQsQ0FBQyxDQUFDVyxDQUFGLENBQUkwQyxXQUFKLENBQWdCOUMsSUFBSSxDQUFDeUIsU0FBckI7QUFBWixPQUFqQjtBQUNBLFVBQU1DLElBQUksR0FBR2pDLENBQUMsQ0FBQ1csQ0FBRixDQUFJdUIsaUJBQUosQ0FBc0IvQixPQUFPLENBQUNHLE1BQTlCLENBQWI7O0FBQ0EsVUFBSTJCLElBQUosRUFBVTtBQUNSN0IsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVosRUFEUSxDQUVSOztBQUNBNEIsUUFBQUEsSUFBSSxDQUFDRSxJQUFMLENBQVUsMkJBQWNuQyxDQUFDLENBQUNNLE1BQWhCLEVBQXdCTCxnQkFBSXFELFVBQTVCLEVBQXdDTixRQUF4QyxDQUFWLEVBQTZELEtBQTdEO0FBQ0Q7QUFDRixLQVhEOztBQWFBbkQsSUFBQUEsU0FBUyxDQUFDSSxnQkFBSXFELFVBQUwsQ0FBVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsOEJBQTRCLGtCQUFPbkQsT0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDcEJJLGdCQUFBQSxJQURvQixHQUNiSixPQUFPLENBQUNJLElBREssRUFFMUI7O0FBQ00rQixnQkFBQUEsR0FIb0IsR0FHZC9CLElBQUksQ0FBQzZDLFFBSFM7QUFJMUJoRCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QmlDLEdBQTdCLEVBSjBCLENBTTFCOztBQUNBaUIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUNFbEIsR0FBRyxDQUFDbUIsR0FBSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsMENBQVEsa0JBQU92QyxNQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQ0FDRkEsTUFBTSxLQUFLbEIsQ0FBQyxDQUFDTSxNQUFiLElBQXVCLENBQUNOLENBQUMsQ0FBQ1csQ0FBRixDQUFJUSxXQUFKLENBQWdCRCxNQUFoQixDQUR0QjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1DQUdFbEIsQ0FBQyxDQUFDMEQsS0FBRixDQUFReEMsTUFBUixFQUFnQmYsT0FBTyxDQUFDRyxNQUF4QixFQUFnQ2tCLEtBQWhDLENBQXNDcEIsT0FBTyxDQUFDQyxHQUE5QyxDQUhGOztBQUFBO0FBS047QUFDQSxnQ0FBSUwsQ0FBQyxDQUFDMkQsS0FBRixDQUFRQyxRQUFSLEtBQXFCMUMsTUFBekIsRUFBaUM7QUFDL0JsQiw4QkFBQUEsQ0FBQyxDQUFDMkMsUUFBRixDQUFXa0IsVUFBWDtBQUNEOztBQVJLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUFSOztBQUFBO0FBQUE7QUFBQTtBQUFBLG9CQURGLEVBUDBCLENBb0IxQjs7QUFwQjBCLHNCQXFCdEI3RCxDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQVIsS0FBcUI1RCxDQUFDLENBQUNNLE1BckJEO0FBQUE7QUFBQTtBQUFBOztBQXNCeEJGLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxXQUFaLEVBdEJ3QixDQXVCeEI7O0FBdkJ3QixvQkF3Qm5CaUMsR0FBRyxDQUFDUCxRQUFKLENBQWEvQixDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQXJCLENBeEJtQjtBQUFBO0FBQUE7QUFBQTs7QUF5QnRCO0FBQ01sRCxnQkFBQUEsS0ExQmdCLEdBMEJSVixDQUFDLENBQUNXLENBQUYsQ0FBSW1ELGVBQUosQ0FBb0I5RCxDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQTVCLEVBQXNDO0FBQ2xERyxrQkFBQUEsU0FBUyxFQUFFNUQsT0FBTyxDQUFDRztBQUQrQixpQkFBdEMsQ0ExQlE7O0FBQUEsb0JBNkJqQkksS0E3QmlCO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBOEJ0Qk4sZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLDJCQUFaLEVBQXlDTCxDQUFDLENBQUMyRCxLQUFGLENBQVFDLFFBQWpELEVBOUJzQixDQStCdEI7O0FBQ0E1RCxnQkFBQUEsQ0FBQyxDQUFDNEQsUUFBRixDQUFXNUQsQ0FBQyxDQUFDMkQsS0FBRixDQUFRQyxRQUFuQixFQUE2QmxELEtBQTdCOztBQWhDc0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBNUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFvQ0Q7Ozs7NkJBRVFzRCxHLEVBQWFDLEcsRUFBVTtBQUM5QjdELE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUIyRCxHQUF2QixFQUE0QkMsR0FBNUI7O0FBQ0EsVUFBSXBDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZakMsU0FBWixFQUF1QmtDLFFBQXZCLENBQWdDaUMsR0FBaEMsQ0FBSixFQUEwQztBQUN4Q25FLFFBQUFBLFNBQVMsQ0FBQ21FLEdBQUQsQ0FBVCxDQUFlQyxHQUFmO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICBjb25zdCBrID0ga2FkO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL+WPl+OBkeWPluOCi1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtzaGExKGRhdGEudmFsdWUpLnRvU3RyaW5nKCldID0gZGF0YS52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy/jgq3jg7zjgpLopovjgaTjgYvjgaPjgZ/jgajjgYTjgYbjg6Hjg4Pjgrvjg7zjgrjjgpLmiLvjgZlcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHtcbiAgICAgICAgICAgIGZpbmQ6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBcImthZFwiXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0O1xuICAgICAgICBjb25zdCBfID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgaWYgKF8pXG4gICAgICAgICAgXy5zZW5kKFxuICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgICAgICAgIGZpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLmZpbmQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2sub25GaW5kVmFsdWUoZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUElOR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgcmVjZWl2ZWRcIik7XG4gICAgICAgIC8v44OO44O844OJSUTjgYvjgonjg5TjgqLjgpLlj5blvpdcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBuZXR3b3JrLm5vZGVJZCB9O1xuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLlBPTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuUE9OR10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvbmcgcmVjZWl2ZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgICAvL3Bpbmfjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgay5jYWxsYmFjay5vblBpbmdbbmV0d29yay5ub2RlSWRdKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICAvL+mdnuWQjOacn+OCkuOBvuOBqOOCgeOBpuOChOOCi1xuICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgIGlkcy5tYXAoYXN5bmMgKHRhcmdldDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19