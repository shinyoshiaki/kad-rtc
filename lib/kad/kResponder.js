"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kademlia = require("./kademlia");

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

    _defineProperty(this, "storeChunks", {});

    var k = kad;
    this.playOfferQueue();

    responder[_KConst.default.STORE] =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(network) {
        var data, mine, close, target, isSdp;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("on store", network.nodeId);
                data = network.data;

                if (k.cypher.decrypt(data.sign, data.pubKey) === data.hash) {
                  _context.next = 5;
                  break;
                }

                console.log("invalid store");
                return _context.abrupt("return");

              case 5:
                //自分と送信元の距離
                mine = (0, _kadDistance.distance)(k.nodeId, data.key); //自分のkbuckets中で送信元に一番近い距離

                close = k.f.getCloseEstDist(data.key);

                if (mine > close) {
                  console.log("store transfer", "\ndata", data); //storeし直す

                  k.store(data.sender, data.key, data.value, {
                    excludeId: network.nodeId
                  });
                } else {
                  console.log("store arrived", mine, close, "\ndata", data);
                }

                target = data.sender;
                isSdp = false;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 21;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 21;
                  break;
                }

                console.log("is signaling");
                isSdp = true;

                if (!(data.value.sdp.type === "offer")) {
                  _context.next = 20;
                  break;
                }

                console.log("kad received offer", data.sender);
                _context.next = 18;
                return k.answer(target, data.value.sdp, data.value.proxy).catch(console.log);

              case 18:
                _context.next = 21;
                break;

              case 20:
                if (data.value.sdp.type === "answer") {
                  console.log("kad received answer", data.sender);

                  try {
                    console.log(k.ref[target]);
                    k.ref[target].setAnswer(data.value.sdp);
                  } catch (error) {
                    console.log(error);
                  }
                }

              case 21:
                //レプリケーション
                if (!isSdp) {
                  (0, _kademlia.excuteEvent)(kad.events.store, data.value);
                  k.keyValueList[data.key] = data.value;
                }

              case 22:
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

      if (!(k.cypher.decrypt(data.sign, data.pubKey) === data.hash)) {
        console.log("invalid store chunks");
        return;
      }

      if (data.index === 0) {
        _this.storeChunks[data.key] = [];
      }

      console.log("storechunks buffer2ab", data.value.buffer);

      _this.storeChunks[data.key].push(data.value.buffer);

      if (data.index === data.size - 1) {
        console.log("store chunks chunks received", _this.storeChunks[data.key]); //レプリケーション

        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        (0, _kademlia.excuteEvent)(kad.events.store, {
          chunks: _this.storeChunks[data.key]
        });
        var mine = (0, _kadDistance.distance)(k.nodeId, data.key);
        var close = k.f.getCloseEstDist(data.key);

        if (mine > close) {
          console.log("store transfer", "\ndata", data, _this.storeChunks[data.key]);
          k.storeChunks(data.sender, data.key, _this.storeChunks[data.key], {
            excludeId: network.nodeId
          });
        } else {
          console.log("store arrived", mine, close, "\ndata", data, _this.storeChunks[data.key]);
        }
      }
    };

    responder[_KConst.default.FINDVALUE] = function (network) {
      console.log("on findvalue", network.nodeId);
      var data = network.data; //ターゲットのキーを持っていたら

      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        var value = k.keyValueList[data.targetKey];
        console.log("onfindvalue i have value", {
          value: value
        });
        var peer = k.f.getPeerFromnodeId(network.nodeId);
        if (!peer) return;
        var sendData;

        if (value.chunks) {
          //ラージファイル
          console.log("on findvalue send chunks");
          var chunks = value.chunks;
          chunks.forEach(function (chunk, i) {
            sendData = {
              chunks: {
                value: Buffer.from(chunk),
                key: data.targetKey,
                index: i,
                size: chunks.length
              }
            };
            console.log("findvalue senddata", {
              chunk: chunk
            }, {
              sendData: sendData
            });
            peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
          });
        } else {
          //スモールファイル
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
      var data = network.data;
      console.log("findvalue r", {
        data: data
      }); //valueを発見していれば

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

        console.log("findvalue r chunks bf2ab", data.chunks, data.chunks.value.buffer);

        _this.storeChunks[data.chunks.key].push(data.chunks.value.buffer);

        if (data.chunks.index === data.chunks.size - 1) {
          console.log("findvalue r", _this.storeChunks[data.chunks.key]);
          k.keyValueList[data.chunks.key] = {
            chunks: _this.storeChunks[data.chunks.key]
          };

          k.callback._onFindValue({
            chunks: _this.storeChunks[data.chunks.key]
          });
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
                    k.callback._onFindNode(target);
                  }
                };

                for (_key in ids) {
                  _loop(_key);
                } //初期動作のfindnodeでなければ


                if (!(k.state.findNode !== k.nodeId)) {
                  _context3.next = 14;
                  break;
                }

                console.log("not found"); //ノードIDが見つからなければ

                if (ids.includes(k.state.findNode)) {
                  _context3.next = 14;
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

                _context3.next = 14;
                return k.findNode(k.state.findNode, close).catch(console.log);

              case 14:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJjeXBoZXIiLCJkZWNyeXB0Iiwic2lnbiIsInB1YktleSIsImhhc2giLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV4Y2x1ZGVJZCIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiZXZlbnRzIiwia2V5VmFsdWVMaXN0IiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsImJ1ZmZlciIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwiQnVmZmVyIiwiZnJvbSIsImxlbmd0aCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsInN1Y2Nlc3MiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIl9vbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiam9iIiwic2hpZnQiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJycGMiLCJyZXEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFNBQWMsR0FBRyxFQUF2Qjs7SUFFcUJDLFU7OztBQUduQixzQkFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBLHdDQUZGLEVBRUU7O0FBQUEseUNBRGEsRUFDYjs7QUFDekIsUUFBTUMsQ0FBQyxHQUFHRCxHQUFWO0FBQ0EsU0FBS0UsY0FBTDs7QUFFQUosSUFBQUEsU0FBUyxDQUFDSyxnQkFBSUMsS0FBTCxDQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBdUIsaUJBQU9DLE9BQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3JCQyxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QkYsT0FBTyxDQUFDRyxNQUFoQztBQUVNQyxnQkFBQUEsSUFIZSxHQUdLSixPQUFPLENBQUNJLElBSGI7O0FBQUEsb0JBS2ZSLENBQUMsQ0FBQ1MsTUFBRixDQUFTQyxPQUFULENBQWlCRixJQUFJLENBQUNHLElBQXRCLEVBQTRCSCxJQUFJLENBQUNJLE1BQWpDLE1BQTZDSixJQUFJLENBQUNLLElBTG5DO0FBQUE7QUFBQTtBQUFBOztBQU1uQlIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVo7QUFObUI7O0FBQUE7QUFVckI7QUFDTVEsZ0JBQUFBLElBWGUsR0FXUiwyQkFBU2QsQ0FBQyxDQUFDTyxNQUFYLEVBQW1CQyxJQUFJLENBQUNPLEdBQXhCLENBWFEsRUFZckI7O0FBQ01DLGdCQUFBQSxLQWJlLEdBYVBoQixDQUFDLENBQUNpQixDQUFGLENBQUlDLGVBQUosQ0FBb0JWLElBQUksQ0FBQ08sR0FBekIsQ0FiTzs7QUFjckIsb0JBQUlELElBQUksR0FBR0UsS0FBWCxFQUFrQjtBQUNoQlgsa0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGdCQUFaLEVBQThCLFFBQTlCLEVBQXdDRSxJQUF4QyxFQURnQixDQUVoQjs7QUFDQVIsa0JBQUFBLENBQUMsQ0FBQ21CLEtBQUYsQ0FBUVgsSUFBSSxDQUFDWSxNQUFiLEVBQXFCWixJQUFJLENBQUNPLEdBQTFCLEVBQStCUCxJQUFJLENBQUNhLEtBQXBDLEVBQTJDO0FBQ3pDQyxvQkFBQUEsU0FBUyxFQUFFbEIsT0FBTyxDQUFDRztBQURzQixtQkFBM0M7QUFHRCxpQkFORCxNQU1PO0FBQ0xGLGtCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCUSxJQUE3QixFQUFtQ0UsS0FBbkMsRUFBMEMsUUFBMUMsRUFBb0RSLElBQXBEO0FBQ0Q7O0FBRUtlLGdCQUFBQSxNQXhCZSxHQXdCTmYsSUFBSSxDQUFDWSxNQXhCQztBQXlCakJJLGdCQUFBQSxLQXpCaUIsR0F5QlQsS0F6QlM7O0FBQUEsc0JBMEJqQmhCLElBQUksQ0FBQ08sR0FBTCxLQUFhZixDQUFDLENBQUNPLE1BQWYsSUFBeUIsQ0FBQ1AsQ0FBQyxDQUFDaUIsQ0FBRixDQUFJUSxXQUFKLENBQWdCRixNQUFoQixDQTFCVDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxxQkEyQmZmLElBQUksQ0FBQ2EsS0FBTCxDQUFXSyxHQTNCSTtBQUFBO0FBQUE7QUFBQTs7QUE0QmpCckIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGNBQVo7QUFDQWtCLGdCQUFBQSxLQUFLLEdBQUcsSUFBUjs7QUE3QmlCLHNCQThCYmhCLElBQUksQ0FBQ2EsS0FBTCxDQUFXSyxHQUFYLENBQWVDLElBQWYsS0FBd0IsT0E5Qlg7QUFBQTtBQUFBO0FBQUE7O0FBK0JmdEIsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG9CQUFaLEVBQWtDRSxJQUFJLENBQUNZLE1BQXZDO0FBL0JlO0FBQUEsdUJBZ0NUcEIsQ0FBQyxDQUNKNEIsTUFERyxDQUNJTCxNQURKLEVBQ1lmLElBQUksQ0FBQ2EsS0FBTCxDQUFXSyxHQUR2QixFQUM0QmxCLElBQUksQ0FBQ2EsS0FBTCxDQUFXUSxLQUR2QyxFQUVIQyxLQUZHLENBRUd6QixPQUFPLENBQUNDLEdBRlgsQ0FoQ1M7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBbUNWLG9CQUFJRSxJQUFJLENBQUNhLEtBQUwsQ0FBV0ssR0FBWCxDQUFlQyxJQUFmLEtBQXdCLFFBQTVCLEVBQXNDO0FBQzNDdEIsa0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBQW1DRSxJQUFJLENBQUNZLE1BQXhDOztBQUNBLHNCQUFJO0FBQ0ZmLG9CQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWU4sQ0FBQyxDQUFDK0IsR0FBRixDQUFNUixNQUFOLENBQVo7QUFDQXZCLG9CQUFBQSxDQUFDLENBQUMrQixHQUFGLENBQU1SLE1BQU4sRUFBY1MsU0FBZCxDQUF3QnhCLElBQUksQ0FBQ2EsS0FBTCxDQUFXSyxHQUFuQztBQUNELG1CQUhELENBR0UsT0FBT08sS0FBUCxFQUFjO0FBQ2Q1QixvQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVkyQixLQUFaO0FBQ0Q7QUFDRjs7QUEzQ2dCO0FBK0NyQjtBQUNBLG9CQUFJLENBQUNULEtBQUwsRUFBWTtBQUNWLDZDQUFZekIsR0FBRyxDQUFDbUMsTUFBSixDQUFXZixLQUF2QixFQUE4QlgsSUFBSSxDQUFDYSxLQUFuQztBQUNBckIsa0JBQUFBLENBQUMsQ0FBQ21DLFlBQUYsQ0FBZTNCLElBQUksQ0FBQ08sR0FBcEIsSUFBMkJQLElBQUksQ0FBQ2EsS0FBaEM7QUFDRDs7QUFuRG9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQXZCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXNEQXhCLElBQUFBLFNBQVMsQ0FBQ0ssZ0JBQUlrQyxZQUFMLENBQVQsR0FBOEIsVUFBQ2hDLE9BQUQsRUFBc0I7QUFDbEQsVUFBTUksSUFBaUIsR0FBR0osT0FBTyxDQUFDSSxJQUFsQzs7QUFFQSxVQUFJLEVBQUVSLENBQUMsQ0FBQ1MsTUFBRixDQUFTQyxPQUFULENBQWlCRixJQUFJLENBQUNHLElBQXRCLEVBQTRCSCxJQUFJLENBQUNJLE1BQWpDLE1BQTZDSixJQUFJLENBQUNLLElBQXBELENBQUosRUFBK0Q7QUFDN0RSLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNCQUFaO0FBQ0E7QUFDRDs7QUFFRCxVQUFJRSxJQUFJLENBQUM2QixLQUFMLEtBQWUsQ0FBbkIsRUFBc0I7QUFDcEIsUUFBQSxLQUFJLENBQUNDLFdBQUwsQ0FBaUI5QixJQUFJLENBQUNPLEdBQXRCLElBQTZCLEVBQTdCO0FBQ0Q7O0FBQ0RWLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHVCQUFaLEVBQXFDRSxJQUFJLENBQUNhLEtBQUwsQ0FBV2tCLE1BQWhEOztBQUNBLE1BQUEsS0FBSSxDQUFDRCxXQUFMLENBQWlCOUIsSUFBSSxDQUFDTyxHQUF0QixFQUEyQnlCLElBQTNCLENBQWdDaEMsSUFBSSxDQUFDYSxLQUFMLENBQVdrQixNQUEzQzs7QUFFQSxVQUFJL0IsSUFBSSxDQUFDNkIsS0FBTCxLQUFlN0IsSUFBSSxDQUFDaUMsSUFBTCxHQUFZLENBQS9CLEVBQWtDO0FBQ2hDcEMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksOEJBQVosRUFBNEMsS0FBSSxDQUFDZ0MsV0FBTCxDQUFpQjlCLElBQUksQ0FBQ08sR0FBdEIsQ0FBNUMsRUFEZ0MsQ0FFaEM7O0FBQ0FmLFFBQUFBLENBQUMsQ0FBQ21DLFlBQUYsQ0FBZTNCLElBQUksQ0FBQ08sR0FBcEIsSUFBMkI7QUFBRTJCLFVBQUFBLE1BQU0sRUFBRSxLQUFJLENBQUNKLFdBQUwsQ0FBaUI5QixJQUFJLENBQUNPLEdBQXRCO0FBQVYsU0FBM0I7QUFFQSxtQ0FBWWhCLEdBQUcsQ0FBQ21DLE1BQUosQ0FBV2YsS0FBdkIsRUFBOEI7QUFBRXVCLFVBQUFBLE1BQU0sRUFBRSxLQUFJLENBQUNKLFdBQUwsQ0FBaUI5QixJQUFJLENBQUNPLEdBQXRCO0FBQVYsU0FBOUI7QUFFQSxZQUFNRCxJQUFJLEdBQUcsMkJBQVNkLENBQUMsQ0FBQ08sTUFBWCxFQUFtQkMsSUFBSSxDQUFDTyxHQUF4QixDQUFiO0FBQ0EsWUFBTUMsS0FBSyxHQUFHaEIsQ0FBQyxDQUFDaUIsQ0FBRixDQUFJQyxlQUFKLENBQW9CVixJQUFJLENBQUNPLEdBQXpCLENBQWQ7O0FBQ0EsWUFBSUQsSUFBSSxHQUFHRSxLQUFYLEVBQWtCO0FBQ2hCWCxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FDRSxnQkFERixFQUVFLFFBRkYsRUFHRUUsSUFIRixFQUlFLEtBQUksQ0FBQzhCLFdBQUwsQ0FBaUI5QixJQUFJLENBQUNPLEdBQXRCLENBSkY7QUFNQWYsVUFBQUEsQ0FBQyxDQUFDc0MsV0FBRixDQUFjOUIsSUFBSSxDQUFDWSxNQUFuQixFQUEyQlosSUFBSSxDQUFDTyxHQUFoQyxFQUFxQyxLQUFJLENBQUN1QixXQUFMLENBQWlCOUIsSUFBSSxDQUFDTyxHQUF0QixDQUFyQyxFQUFpRTtBQUMvRE8sWUFBQUEsU0FBUyxFQUFFbEIsT0FBTyxDQUFDRztBQUQ0QyxXQUFqRTtBQUdELFNBVkQsTUFVTztBQUNMRixVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FDRSxlQURGLEVBRUVRLElBRkYsRUFHRUUsS0FIRixFQUlFLFFBSkYsRUFLRVIsSUFMRixFQU1FLEtBQUksQ0FBQzhCLFdBQUwsQ0FBaUI5QixJQUFJLENBQUNPLEdBQXRCLENBTkY7QUFRRDtBQUNGO0FBQ0YsS0E1Q0Q7O0FBOENBbEIsSUFBQUEsU0FBUyxDQUFDSyxnQkFBSXlDLFNBQUwsQ0FBVCxHQUEyQixVQUFDdkMsT0FBRCxFQUFrQjtBQUMzQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QkYsT0FBTyxDQUFDRyxNQUFwQztBQUNBLFVBQU1DLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQixDQUYyQyxDQUczQzs7QUFDQSxVQUFJb0MsTUFBTSxDQUFDQyxJQUFQLENBQVk3QyxDQUFDLENBQUNtQyxZQUFkLEVBQTRCVyxRQUE1QixDQUFxQ3RDLElBQUksQ0FBQ3VDLFNBQTFDLENBQUosRUFBMEQ7QUFDeEQsWUFBTTFCLEtBQUssR0FBR3JCLENBQUMsQ0FBQ21DLFlBQUYsQ0FBZTNCLElBQUksQ0FBQ3VDLFNBQXBCLENBQWQ7QUFDQTFDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLDBCQUFaLEVBQXdDO0FBQUVlLFVBQUFBLEtBQUssRUFBTEE7QUFBRixTQUF4QztBQUNBLFlBQU0yQixJQUFJLEdBQUdoRCxDQUFDLENBQUNpQixDQUFGLENBQUlnQyxpQkFBSixDQUFzQjdDLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYjtBQUVBLFlBQUksQ0FBQ3lDLElBQUwsRUFBVztBQUNYLFlBQUlFLFFBQUo7O0FBRUEsWUFBSTdCLEtBQUssQ0FBQ3FCLE1BQVYsRUFBa0I7QUFDaEI7QUFDQXJDLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLDBCQUFaO0FBQ0EsY0FBTW9DLE1BQWEsR0FBR3JCLEtBQUssQ0FBQ3FCLE1BQTVCO0FBQ0FBLFVBQUFBLE1BQU0sQ0FBQ1MsT0FBUCxDQUFlLFVBQUNDLEtBQUQsRUFBUUMsQ0FBUixFQUFjO0FBQzNCSCxZQUFBQSxRQUFRLEdBQUc7QUFDVFIsY0FBQUEsTUFBTSxFQUFFO0FBQ05yQixnQkFBQUEsS0FBSyxFQUFFaUMsTUFBTSxDQUFDQyxJQUFQLENBQVlILEtBQVosQ0FERDtBQUVOckMsZ0JBQUFBLEdBQUcsRUFBRVAsSUFBSSxDQUFDdUMsU0FGSjtBQUdOVixnQkFBQUEsS0FBSyxFQUFFZ0IsQ0FIRDtBQUlOWixnQkFBQUEsSUFBSSxFQUFFQyxNQUFNLENBQUNjO0FBSlA7QUFEQyxhQUFYO0FBUUFuRCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQztBQUFFOEMsY0FBQUEsS0FBSyxFQUFMQTtBQUFGLGFBQWxDLEVBQTZDO0FBQUVGLGNBQUFBLFFBQVEsRUFBUkE7QUFBRixhQUE3QztBQUNBRixZQUFBQSxJQUFJLENBQUNTLElBQUwsQ0FDRSwyQkFBY3pELENBQUMsQ0FBQ08sTUFBaEIsRUFBd0JMLGdCQUFJd0QsV0FBNUIsRUFBeUNSLFFBQXpDLENBREYsRUFFRSxLQUZGO0FBSUQsV0FkRDtBQWVELFNBbkJELE1BbUJPO0FBQ0w7QUFDQUEsVUFBQUEsUUFBUSxHQUFHO0FBQ1RTLFlBQUFBLE9BQU8sRUFBRTtBQUFFdEMsY0FBQUEsS0FBSyxFQUFMQSxLQUFGO0FBQVNOLGNBQUFBLEdBQUcsRUFBRVAsSUFBSSxDQUFDdUM7QUFBbkI7QUFEQSxXQUFYO0FBR0FDLFVBQUFBLElBQUksQ0FBQ1MsSUFBTCxDQUFVLDJCQUFjekQsQ0FBQyxDQUFDTyxNQUFoQixFQUF3QkwsZ0JBQUl3RCxXQUE1QixFQUF5Q1IsUUFBekMsQ0FBVixFQUE4RCxLQUE5RDtBQUNEO0FBQ0YsT0FsQ0QsTUFrQ087QUFDTDtBQUNBLFlBQU1VLEdBQUcsR0FBRzVELENBQUMsQ0FBQ2lCLENBQUYsQ0FBSTRDLGtCQUFKLENBQXVCckQsSUFBSSxDQUFDdUMsU0FBNUIsQ0FBWjs7QUFDQSxZQUFNQyxLQUFJLEdBQUdoRCxDQUFDLENBQUNpQixDQUFGLENBQUlnQyxpQkFBSixDQUFzQjdDLE9BQU8sQ0FBQ0csTUFBOUIsQ0FBYjs7QUFDQUYsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWjs7QUFDQSxZQUFJMEMsS0FBSixFQUFVO0FBQ1IsY0FBTUUsU0FBb0IsR0FBRztBQUMzQlksWUFBQUEsSUFBSSxFQUFFO0FBQ0pGLGNBQUFBLEdBQUcsRUFBRUEsR0FERDtBQUVKRyxjQUFBQSxVQUFVLEVBQUV2RCxJQUFJLENBQUN1RCxVQUZiO0FBR0poQixjQUFBQSxTQUFTLEVBQUV2QyxJQUFJLENBQUN1QyxTQUhaO0FBSUppQixjQUFBQSxFQUFFLEVBQUU1RCxPQUFPLENBQUNHO0FBSlI7QUFEcUIsV0FBN0I7O0FBUUF5QyxVQUFBQSxLQUFJLENBQUNTLElBQUwsQ0FBVSwyQkFBY3pELENBQUMsQ0FBQ08sTUFBaEIsRUFBd0JMLGdCQUFJd0QsV0FBNUIsRUFBeUNSLFNBQXpDLENBQVYsRUFBOEQsS0FBOUQ7QUFDRDtBQUNGO0FBQ0YsS0F2REQ7O0FBeURBckQsSUFBQUEsU0FBUyxDQUFDSyxnQkFBSXdELFdBQUwsQ0FBVCxHQUE2QixVQUFDdEQsT0FBRCxFQUFzQjtBQUNqRCxVQUFNSSxJQUFnQixHQUFHSixPQUFPLENBQUNJLElBQWpDO0FBQ0FILE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkI7QUFBRUUsUUFBQUEsSUFBSSxFQUFKQTtBQUFGLE9BQTNCLEVBRmlELENBR2pEOztBQUNBLFVBQUlBLElBQUksQ0FBQ21ELE9BQVQsRUFBa0I7QUFDaEI7QUFDQXRELFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGlCQUFaOztBQUNBTixRQUFBQSxDQUFDLENBQUNpRSxRQUFGLENBQVdDLFlBQVgsQ0FBd0IxRCxJQUFJLENBQUNtRCxPQUFMLENBQWF0QyxLQUFyQzs7QUFDQXJCLFFBQUFBLENBQUMsQ0FBQ21DLFlBQUYsQ0FBZTNCLElBQUksQ0FBQ21ELE9BQUwsQ0FBYTVDLEdBQTVCLElBQW1DUCxJQUFJLENBQUNtRCxPQUFMLENBQWF0QyxLQUFoRDtBQUNELE9BTEQsTUFLTyxJQUFJYixJQUFJLENBQUNrQyxNQUFULEVBQWlCO0FBQ3RCO0FBQ0EsWUFBSWxDLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWUwsS0FBWixLQUFzQixDQUExQixFQUE2QjtBQUMzQixVQUFBLEtBQUksQ0FBQ0MsV0FBTCxDQUFpQjlCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWTNCLEdBQTdCLElBQW9DLEVBQXBDO0FBQ0Q7O0FBQ0RWLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUNFLDBCQURGLEVBRUVFLElBQUksQ0FBQ2tDLE1BRlAsRUFHRWxDLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWXJCLEtBQVosQ0FBa0JrQixNQUhwQjs7QUFLQSxRQUFBLEtBQUksQ0FBQ0QsV0FBTCxDQUFpQjlCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWTNCLEdBQTdCLEVBQWtDeUIsSUFBbEMsQ0FBdUNoQyxJQUFJLENBQUNrQyxNQUFMLENBQVlyQixLQUFaLENBQWtCa0IsTUFBekQ7O0FBQ0EsWUFBSS9CLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWUwsS0FBWixLQUFzQjdCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWUQsSUFBWixHQUFtQixDQUE3QyxFQUFnRDtBQUM5Q3BDLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkIsS0FBSSxDQUFDZ0MsV0FBTCxDQUFpQjlCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWTNCLEdBQTdCLENBQTNCO0FBQ0FmLFVBQUFBLENBQUMsQ0FBQ21DLFlBQUYsQ0FBZTNCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWTNCLEdBQTNCLElBQWtDO0FBQ2hDMkIsWUFBQUEsTUFBTSxFQUFFLEtBQUksQ0FBQ0osV0FBTCxDQUFpQjlCLElBQUksQ0FBQ2tDLE1BQUwsQ0FBWTNCLEdBQTdCO0FBRHdCLFdBQWxDOztBQUdBZixVQUFBQSxDQUFDLENBQUNpRSxRQUFGLENBQVdDLFlBQVgsQ0FBd0I7QUFDdEJ4QixZQUFBQSxNQUFNLEVBQUUsS0FBSSxDQUFDSixXQUFMLENBQWlCOUIsSUFBSSxDQUFDa0MsTUFBTCxDQUFZM0IsR0FBN0I7QUFEYyxXQUF4QjtBQUdEO0FBQ0YsT0FwQk0sTUFvQkEsSUFBSVAsSUFBSSxDQUFDc0QsSUFBTCxJQUFhdEQsSUFBSSxDQUFDc0QsSUFBTCxDQUFVRSxFQUFWLEtBQWlCaEUsQ0FBQyxDQUFDTyxNQUFwQyxFQUE0QztBQUNqREYsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlKLGdCQUFJd0QsV0FBaEIsRUFBNkIsU0FBN0IsRUFBd0NsRCxJQUF4QyxFQURpRCxDQUVqRDs7QUFDQSxhQUFLLElBQUkyRCxFQUFULElBQWUzRCxJQUFJLENBQUNzRCxJQUFMLENBQVVGLEdBQXpCLEVBQThCO0FBQzVCLGNBQU1aLElBQUksR0FBR2hELENBQUMsQ0FBQ2lCLENBQUYsQ0FBSWdDLGlCQUFKLENBQXNCa0IsRUFBdEIsQ0FBYjtBQUNBLGNBQUksQ0FBQ25CLElBQUwsRUFBVztBQUNYaEQsVUFBQUEsQ0FBQyxDQUFDb0UsV0FBRixDQUFjNUQsSUFBSSxDQUFDc0QsSUFBTCxDQUFVZixTQUF4QixFQUFtQ0MsSUFBbkM7QUFDRDtBQUNGO0FBQ0YsS0F0Q0Q7O0FBd0NBbkQsSUFBQUEsU0FBUyxDQUFDSyxnQkFBSW1FLFFBQUwsQ0FBVCxHQUEwQixVQUFDakUsT0FBRCxFQUFrQjtBQUMxQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQUEyQkYsT0FBTyxDQUFDRyxNQUFuQztBQUNBLFVBQU1DLElBQUksR0FBR0osT0FBTyxDQUFDSSxJQUFyQixDQUYwQyxDQUcxQzs7QUFDQSxVQUFNMEMsUUFBUSxHQUFHO0FBQUVvQixRQUFBQSxRQUFRLEVBQUV0RSxDQUFDLENBQUNpQixDQUFGLENBQUlzRCxXQUFKLENBQWdCL0QsSUFBSSxDQUFDdUMsU0FBckI7QUFBWixPQUFqQjtBQUVBMUMsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlGLE9BQU8sQ0FBQ0csTUFBcEIsRUFBNEI7QUFDMUJpRSxRQUFBQSxPQUFPLEVBQUV4RSxDQUFDLENBQUNpQixDQUFGLENBQUl3RCxhQUFKLEVBRGlCO0FBRTFCYixRQUFBQSxHQUFHLEVBQUVWLFFBQVEsQ0FBQ29CO0FBRlksT0FBNUI7QUFLQSxVQUFNdEIsSUFBSSxHQUFHaEQsQ0FBQyxDQUFDaUIsQ0FBRixDQUFJZ0MsaUJBQUosQ0FBc0I3QyxPQUFPLENBQUNHLE1BQTlCLENBQWI7O0FBQ0EsVUFBSXlDLElBQUosRUFBVTtBQUNSM0MsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVosRUFBaUM0QyxRQUFRLENBQUNvQixRQUExQyxFQURRLENBRVI7O0FBQ0F0QixRQUFBQSxJQUFJLENBQUNTLElBQUwsQ0FBVSwyQkFBY3pELENBQUMsQ0FBQ08sTUFBaEIsRUFBd0JMLGdCQUFJd0UsVUFBNUIsRUFBd0N4QixRQUF4QyxDQUFWLEVBQTZELEtBQTdEO0FBQ0Q7QUFDRixLQWpCRDs7QUFtQkFyRCxJQUFBQSxTQUFTLENBQUNLLGdCQUFJd0UsVUFBTCxDQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBNEIsa0JBQU90RSxPQUFQO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDcEJJLGdCQUFBQSxJQURvQixHQUNiSixPQUFPLENBQUNJLElBREssRUFFMUI7O0FBQ01vRCxnQkFBQUEsR0FIb0IsR0FHZHBELElBQUksQ0FBQzhELFFBSFM7QUFJMUJqRSxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QnNELEdBQTdCOztBQUowQix1Q0FNakI3QyxJQU5pQjtBQU94QixzQkFBTVEsTUFBTSxHQUFHcUMsR0FBRyxDQUFDN0MsSUFBRCxDQUFsQjs7QUFDQSxrQkFBQSxLQUFJLENBQUM0RCxVQUFMLENBQWdCbkMsSUFBaEI7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQ0FBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuQm5DLDRCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCaUIsTUFBNUI7O0FBRG1CLGtDQUVmQSxNQUFNLEtBQUt2QixDQUFDLENBQUNPLE1BQWIsSUFBdUIsQ0FBQ1AsQ0FBQyxDQUFDaUIsQ0FBRixDQUFJUSxXQUFKLENBQWdCRixNQUFoQixDQUZUO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbUNBSVh2QixDQUFDLENBQUM0RSxLQUFGLENBQVFyRCxNQUFSLEVBQWdCbkIsT0FBTyxDQUFDRyxNQUF4QixFQUFnQ3VCLEtBQWhDLENBQXNDekIsT0FBTyxDQUFDQyxHQUE5QyxDQUpXOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUFyQixJQVJ3QixDQWV4Qjs7O0FBQ0Esc0JBQUlOLENBQUMsQ0FBQzZFLEtBQUYsQ0FBUUMsUUFBUixLQUFxQnZELE1BQXpCLEVBQWlDO0FBQy9CdkIsb0JBQUFBLENBQUMsQ0FBQ2lFLFFBQUYsQ0FBV2MsV0FBWCxDQUF1QnhELE1BQXZCO0FBQ0Q7QUFsQnVCOztBQU0xQixxQkFBU1IsSUFBVCxJQUFnQjZDLEdBQWhCLEVBQXFCO0FBQUEsd0JBQVo3QyxJQUFZO0FBYXBCLGlCQW5CeUIsQ0FxQjFCOzs7QUFyQjBCLHNCQXNCdEJmLENBQUMsQ0FBQzZFLEtBQUYsQ0FBUUMsUUFBUixLQUFxQjlFLENBQUMsQ0FBQ08sTUF0QkQ7QUFBQTtBQUFBO0FBQUE7O0FBdUJ4QkYsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFdBQVosRUF2QndCLENBd0J4Qjs7QUF4QndCLG9CQXlCbkJzRCxHQUFHLENBQUNkLFFBQUosQ0FBYTlDLENBQUMsQ0FBQzZFLEtBQUYsQ0FBUUMsUUFBckIsQ0F6Qm1CO0FBQUE7QUFBQTtBQUFBOztBQTBCdEI7QUFDTTlELGdCQUFBQSxLQTNCZ0IsR0EyQlJoQixDQUFDLENBQUNpQixDQUFGLENBQUkrRCxlQUFKLENBQW9CaEYsQ0FBQyxDQUFDNkUsS0FBRixDQUFRQyxRQUE1QixFQUFzQztBQUNsRHhELGtCQUFBQSxTQUFTLEVBQUVsQixPQUFPLENBQUNHO0FBRCtCLGlCQUF0QyxDQTNCUTs7QUFBQSxvQkE4QmpCUyxLQTlCaUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUErQnRCWCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNOLENBQUMsQ0FBQzZFLEtBQUYsQ0FBUUMsUUFBakQsRUEvQnNCLENBZ0N0Qjs7QUFoQ3NCO0FBQUEsdUJBaUNoQjlFLENBQUMsQ0FBQzhFLFFBQUYsQ0FBVzlFLENBQUMsQ0FBQzZFLEtBQUYsQ0FBUUMsUUFBbkIsRUFBNkI5RCxLQUE3QixFQUFvQ2MsS0FBcEMsQ0FBMEN6QixPQUFPLENBQUNDLEdBQWxELENBakNnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXFDRDs7Ozs7Ozs7Ozs7OztxQkFHUSxJOzs7OztzQkFDRCxLQUFLcUUsVUFBTCxDQUFnQm5CLE1BQWhCLEdBQXlCLEM7Ozs7O0FBQ3JCeUIsZ0JBQUFBLEcsR0FBTSxLQUFLTixVQUFMLENBQWdCLENBQWhCLEM7QUFDWnRFLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCO0FBQUUyRSxrQkFBQUEsR0FBRyxFQUFIQTtBQUFGLGlCQUF0QixFQUErQixLQUFLTixVQUFwQzs7dUJBQ01NLEdBQUcsRTs7O0FBQ1QscUJBQUtOLFVBQUwsQ0FBZ0JPLEtBQWhCOzs7Ozs7dUJBRU0sSUFBSUMsT0FBSixDQUFZLFVBQUFDLENBQUM7QUFBQSx5QkFBSUMsVUFBVSxDQUFDRCxDQUFELEVBQUksSUFBSixDQUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCbEYsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QmdGLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJM0MsTUFBTSxDQUFDQyxJQUFQLENBQVloRCxTQUFaLEVBQXVCaUQsUUFBdkIsQ0FBZ0N3QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDekYsUUFBQUEsU0FBUyxDQUFDeUYsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuY29uc3QgcmVzcG9uZGVyOiBhbnkgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1Jlc3BvbmRlciB7XG4gIG9mZmVyUXVldWU6IEFycmF5PGFueT4gPSBbXTtcbiAgc3RvcmVDaHVua3M6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG5cbiAgICAgIGlmICghKGsuY3lwaGVyLmRlY3J5cHQoZGF0YS5zaWduLCBkYXRhLnB1YktleSkgPT09IGRhdGEuaGFzaCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpbnZhbGlkIHN0b3JlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlLCB7XG4gICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcbiAgICAgIGxldCBpc1NkcCA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG4gICAgICAgICAgaXNTZHAgPSB0cnVlO1xuICAgICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIG9mZmVyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIGF3YWl0IGtcbiAgICAgICAgICAgICAgLmFuc3dlcih0YXJnZXQsIGRhdGEudmFsdWUuc2RwLCBkYXRhLnZhbHVlLnByb3h5KVxuICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJhbnN3ZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgYW5zd2VyXCIsIGRhdGEuc2VuZGVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGsucmVmW3RhcmdldF0pO1xuICAgICAgICAgICAgICBrLnJlZlt0YXJnZXRdLnNldEFuc3dlcihkYXRhLnZhbHVlLnNkcCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICBpZiAoIWlzU2RwKSB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KGthZC5ldmVudHMuc3RvcmUsIGRhdGEudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFX0NIVU5LU10gPSAobmV0d29yazogbmV0d29yaykgPT4ge1xuICAgICAgY29uc3QgZGF0YTogU3RvcmVDaHVua3MgPSBuZXR3b3JrLmRhdGE7XG5cbiAgICAgIGlmICghKGsuY3lwaGVyLmRlY3J5cHQoZGF0YS5zaWduLCBkYXRhLnB1YktleSkgPT09IGRhdGEuaGFzaCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpbnZhbGlkIHN0b3JlIGNodW5rc1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSA9IFtdO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXCJzdG9yZWNodW5rcyBidWZmZXIyYWJcIiwgZGF0YS52YWx1ZS5idWZmZXIpO1xuICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0ucHVzaChkYXRhLnZhbHVlLmJ1ZmZlcik7XG5cbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSBkYXRhLnNpemUgLSAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzIGNodW5rcyByZWNlaXZlZFwiLCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSk7XG4gICAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9O1xuXG4gICAgICAgIGV4Y3V0ZUV2ZW50KGthZC5ldmVudHMuc3RvcmUsIHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9KTtcblxuICAgICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSB0cmFuc2ZlclwiLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICAgIGsuc3RvcmVDaHVua3MoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSBhcnJpdmVkXCIsXG4gICAgICAgICAgICBtaW5lLFxuICAgICAgICAgICAgY2xvc2UsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v44K/44O844Ky44OD44OI44Gu44Kt44O844KS5oyB44Gj44Gm44GE44Gf44KJXG4gICAgICBpZiAoT2JqZWN0LmtleXMoay5rZXlWYWx1ZUxpc3QpLmluY2x1ZGVzKGRhdGEudGFyZ2V0S2V5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGsua2V5VmFsdWVMaXN0W2RhdGEudGFyZ2V0S2V5XTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvbmZpbmR2YWx1ZSBpIGhhdmUgdmFsdWVcIiwgeyB2YWx1ZSB9KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGxldCBzZW5kRGF0YTogRmluZFZhbHVlUjtcblxuICAgICAgICBpZiAodmFsdWUuY2h1bmtzKSB7XG4gICAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZSBzZW5kIGNodW5rc1wiKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IGFueVtdID0gdmFsdWUuY2h1bmtzO1xuICAgICAgICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgIGNodW5rczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICAgICAga2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBzZW5kZGF0YVwiLCB7IGNodW5rIH0sIHsgc2VuZERhdGEgfSk7XG4gICAgICAgICAgICBwZWVyLnNlbmQoXG4gICAgICAgICAgICAgIG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLFxuICAgICAgICAgICAgICBcImthZFwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8v44K544Oi44O844Or44OV44Kh44Kk44OrXG4gICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiB7IHZhbHVlLCBrZXk6IGRhdGEudGFyZ2V0S2V5IH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Kt44O844Gr5pyA44KC6L+R44GE44OU44KiXG4gICAgICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3QoZGF0YS50YXJnZXRLZXkpO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZSBzZW5kIHZhbHVlXCIpO1xuICAgICAgICBpZiAocGVlcikge1xuICAgICAgICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWVSID0ge1xuICAgICAgICAgICAgZmFpbDoge1xuICAgICAgICAgICAgICBpZHM6IGlkcyxcbiAgICAgICAgICAgICAgdGFyZ2V0Tm9kZTogZGF0YS50YXJnZXROb2RlLFxuICAgICAgICAgICAgICB0YXJnZXRLZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICB0bzogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSAobmV0d29yazogbmV0d29yaykgPT4ge1xuICAgICAgY29uc3QgZGF0YTogRmluZFZhbHVlUiA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHJcIiwgeyBkYXRhIH0pO1xuICAgICAgLy92YWx1ZeOCkueZuuimi+OBl+OBpuOBhOOCjOOBsFxuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICAvL+mAmuW4uOODleOCoeOCpOODq1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSBmb3VuZFwiKTtcbiAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoZGF0YS5zdWNjZXNzLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5zdWNjZXNzLmtleV0gPSBkYXRhLnN1Y2Nlc3MudmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuY2h1bmtzKSB7XG4gICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiZmluZHZhbHVlIHIgY2h1bmtzIGJmMmFiXCIsXG4gICAgICAgICAgZGF0YS5jaHVua3MsXG4gICAgICAgICAgZGF0YS5jaHVua3MudmFsdWUuYnVmZmVyXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XS5wdXNoKGRhdGEuY2h1bmtzLnZhbHVlLmJ1ZmZlcik7XG4gICAgICAgIGlmIChkYXRhLmNodW5rcy5pbmRleCA9PT0gZGF0YS5jaHVua3Muc2l6ZSAtIDEpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSByXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XSk7XG4gICAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5jaHVua3Mua2V5XSA9IHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSh7XG4gICAgICAgICAgICBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmFpbCAmJiBkYXRhLmZhaWwudG8gPT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlZi5GSU5EVkFMVUVfUiwgXCJyZSBmaW5kXCIsIGRhdGEpO1xuICAgICAgICAvL+eZuuimi+OBp+OBjeOBpuOBhOOBquOBkeOCjOOBsOWAmeijnOOBq+WvvuOBl+OBpuWGjeaOoue0olxuICAgICAgICBmb3IgKGxldCBpZCBpbiBkYXRhLmZhaWwuaWRzKSB7XG4gICAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChpZCk7XG4gICAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmZhaWwudGFyZ2V0S2V5LCBwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGVcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6KaB5rGC44GV44KM44Gf44Kt44O844Gr6L+R44GE6KSH5pWw44Gu44Kt44O844KS6YCB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgY2xvc2VJRHM6IGsuZi5nZXRDbG9zZUlEcyhkYXRhLnRhcmdldEtleSkgfTtcblxuICAgICAgY29uc29sZS5sb2cobmV0d29yay5ub2RlSWQsIHtcbiAgICAgICAgYWxscGVlcjogay5mLmdldEFsbFBlZXJJZHMoKSxcbiAgICAgICAgaWRzOiBzZW5kRGF0YS5jbG9zZUlEc1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kYmFjayBmaW5kbm9kZVwiLCBzZW5kRGF0YS5jbG9zZUlEcyk7XG4gICAgICAgIC8v6YCB44KK6L+U44GZXG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+W4sOOBo+OBpuOBjeOBn+ikh+aVsOOBrklEXG4gICAgICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZS1yXCIsIGlkcyk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBpZHMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaWRzW2tleV07XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCB0YXJnZXQpO1xuICAgICAgICAgIGlmICh0YXJnZXQgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcih0YXJnZXQsIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgYXdhaXQgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHBsYXlPZmZlclF1ZXVlKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vZmZlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgam9iID0gdGhpcy5vZmZlclF1ZXVlWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRvIGpvYlwiLCB7IGpvYiB9LCB0aGlzLm9mZmVyUXVldWUpO1xuICAgICAgICBhd2FpdCBqb2IoKTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc3BvbnNlKHJwYzogc3RyaW5nLCByZXE6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIHJwY1wiLCBycGMsIHJlcSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKHJlc3BvbmRlcikuaW5jbHVkZXMocnBjKSkge1xuICAgICAgcmVzcG9uZGVyW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==