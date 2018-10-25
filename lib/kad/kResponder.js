"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kadDistance = require("kad-distance");

var _bson = require("bson");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bson = new _bson.BSON();
var responder = {};

var KResponder =
/*#__PURE__*/
function () {
  function KResponder(kad) {
    var _this = this;

    _classCallCheck(this, KResponder);

    _defineProperty(this, "offerQueue", []);

    _defineProperty(this, "storeChunks", {});

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

    responder[_KConst.default.STORE_CHUNKS] = function (network) {
      var data = network.data;

      if (data.index === 0) {
        _this.storeChunks[data.key] = [];
      }

      _this.storeChunks[data.key].push(data.value);

      if (data.index === data.size - 1) {
        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        var mine = (0, _kadDistance.distance)(k.nodeId, data.key);
        var close = k.f.getCloseEstDist(data.key);

        if (mine > close) {
          console.log("store transfer", "\ndata", data);
          k.storeChunks(data.sender, data.key, _this.storeChunks[data.key]);
        } else {
          console.log("store arrived", mine, close, "\ndata", data);
          k.callback.onStore(k.keyValueList);
        }
      }
    };

    responder[_KConst.default.FINDVALUE] = function (network) {
      console.log("on findvalue", network.nodeId);
      var data = network.data; //ターゲットのキーを持っていたら

      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        var value = k.keyValueList[data.targetKey];
        var peer = k.f.getPeerFromnodeId(network.nodeId); //キーを見つかったというメッセージを戻す

        if (!peer) return;
        var sendData;

        if (value.chunks) {
          var chunks = value.chunks;
          chunks.forEach(function (chunk, i) {
            sendData = {
              chunks: {
                value: chunk,
                key: data.targetKey,
                index: i,
                size: chunks.length
              }
            };
            peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
          });
        } else {
          sendData = {
            success: {
              value: value,
              key: data.targetKey
            }
          };
          peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
        }
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
        //通常ファイル
        console.log("findvalue found");

        k.callback._onFindValue(data.success.value);

        k.keyValueList[data.success.key] = data.success.value;
      } else if (data.chunks) {
        //ラージファイル
        if (data.chunks.index === 0) {
          _this.storeChunks[data.chunks.key] = [];
        }

        _this.storeChunks[data.chunks.key].push(data.chunks.value);

        if (data.chunks.index === data.chunks.size - 1) {
          k.keyValueList[data.chunks.key] = {
            chunks: _this.storeChunks[data.chunks.key]
          };

          k.callback._onFindValue(_this.storeChunks[data.chunks.key]);
        }
      } else if (data.fail && data.fail.to === k.nodeId) {
        console.log(_KConst.default.FINDVALUE_R, "re find", data); //発見できていなければ候補に対して再探索

        for (var id in data.fail.ids) {
          var peer = k.f.getPeerFromnodeId(id);
          if (!peer) return;
          k.doFindvalue(data.fail.targetKey, peer);
        }
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
        var data, ids, _loop, _key, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);

                _loop = function _loop(_key) {
                  var target = ids[_key];

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

                for (_key in ids) {
                  _loop(_key);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwia2V5VmFsdWVMaXN0IiwiY2FsbGJhY2siLCJvblN0b3JlIiwidGFyZ2V0IiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwibGVuZ3RoIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwic3VjY2VzcyIsImlkcyIsImdldENsb3NlRXN0SWRzTGlzdCIsImZhaWwiLCJ0YXJnZXROb2RlIiwidG8iLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIm9uRmluZE5vZGUiLCJnZXRDbG9zZUVzdFBlZXIiLCJleGNsdWRlSWQiLCJqb2IiLCJzaGlmdCIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJwYyIsInJlcSJdLCJtYXBwaW5ncyI6Ijs7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QTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTVCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUNEOzs7Ozs7Ozs7Ozs7O3FCQUdRLEk7Ozs7O3NCQUNELEtBQUtzRCxVQUFMLENBQWdCbEIsTUFBaEIsR0FBeUIsQzs7Ozs7QUFDckJ5QixnQkFBQUEsRyxHQUFNLEtBQUtQLFVBQUwsQ0FBZ0IsQ0FBaEIsQztBQUNaNUQsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0I7QUFBRWtFLGtCQUFBQSxHQUFHLEVBQUhBO0FBQUYsaUJBQXRCLEVBQStCLEtBQUtQLFVBQXBDOzt1QkFDTU8sR0FBRyxFOzs7QUFDVCxxQkFBS1AsVUFBTCxDQUFnQlEsS0FBaEI7Ozs7Ozt1QkFFTSxJQUFJQyxPQUFKLENBQVksVUFBQUMsQ0FBQztBQUFBLHlCQUFJQyxVQUFVLENBQUNELENBQUQsRUFBSSxJQUFKLENBQWQ7QUFBQSxpQkFBYixDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFLSEUsRyxFQUFhQyxHLEVBQVU7QUFDOUJ6RSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCdUUsR0FBdkIsRUFBNEJDLEdBQTVCOztBQUNBLFVBQUl6QyxNQUFNLENBQUNDLElBQVAsQ0FBWXpDLFNBQVosRUFBdUIwQyxRQUF2QixDQUFnQ3NDLEdBQWhDLENBQUosRUFBMEM7QUFDeENoRixRQUFBQSxTQUFTLENBQUNnRixHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIHN0b3JlQ2h1bmtzOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy/lj5fjgZHlj5bjgotcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgICAgay5jYWxsYmFjay5vblN0b3JlKGsua2V5VmFsdWVMaXN0KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG5cbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuXG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0QW5zd2VyKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV9DSFVOS1NdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YTogU3RvcmVDaHVua3MgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0ucHVzaChkYXRhLnZhbHVlKTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSBkYXRhLnNpemUgLSAxKSB7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9O1xuICAgICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAgIGsuc3RvcmVDaHVua3MoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgICAgay5jYWxsYmFjay5vblN0b3JlKGsua2V5VmFsdWVMaXN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy/jgq3jg7zjgpLopovjgaTjgYvjgaPjgZ/jgajjgYTjgYbjg6Hjg4Pjgrvjg7zjgrjjgpLmiLvjgZlcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGxldCBzZW5kRGF0YTogRmluZFZhbHVlUjtcbiAgICAgICAgaWYgKHZhbHVlLmNodW5rcykge1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLFxuICAgICAgICAgICAgICAgIGtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSxcbiAgICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUpO1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IGRhdGEuY2h1bmtzLnNpemUgLSAxKSB7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5vbkZpbmROb2RlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBhc3luYyBwbGF5T2ZmZXJRdWV1ZSgpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMub2ZmZXJRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpvYiA9IHRoaXMub2ZmZXJRdWV1ZVswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJkbyBqb2JcIiwgeyBqb2IgfSwgdGhpcy5vZmZlclF1ZXVlKTtcbiAgICAgICAgYXdhaXQgam9iKCk7XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDApKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=