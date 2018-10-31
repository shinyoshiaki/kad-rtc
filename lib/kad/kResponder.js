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

// import buffer2ab from "buffer-to-arraybuffer";
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
                data = network.data; //自分と送信元の距離

                mine = (0, _kadDistance.distance)(k.nodeId, data.key); //自分のkbuckets中で送信元に一番近い距離

                close = k.f.getCloseEstDist(data.key);

                if (mine > close) {
                  console.log("store transfer", "\ndata", data); //storeし直す

                  k.store(data.sender, data.key, data.value);
                } else {
                  console.log("store arrived", mine, close, "\ndata", data);
                }

                target = data.sender;
                isSdp = false;

                if (!(data.key === k.nodeId && !k.f.isNodeExist(target))) {
                  _context.next = 18;
                  break;
                }

                if (!data.value.sdp) {
                  _context.next = 18;
                  break;
                }

                console.log("is signaling");
                isSdp = true;

                if (!(data.value.sdp.type === "offer")) {
                  _context.next = 17;
                  break;
                }

                console.log("kad received offer", data.sender);
                _context.next = 15;
                return k.answer(target, data.value.sdp, data.value.proxy).catch(console.log);

              case 15:
                _context.next = 18;
                break;

              case 17:
                if (data.value.sdp.type === "answer") {
                  console.log("kad received answer", data.sender);

                  try {
                    console.log(k.ref[target]);
                    k.ref[target].setAnswer(data.value.sdp);
                  } catch (error) {
                    console.log(error);
                  }
                }

              case 18:
                //レプリケーション
                if (!isSdp) {
                  // //キーが衝突しない前提
                  // if (!k.keyValueList[data.key])
                  (0, _kademlia.excuteEvent)(kad.onStore, data.value);
                  k.keyValueList[data.key] = data.value;
                }

              case 19:
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

      console.log("storechunks buffer2ab", data.value.buffer);

      _this.storeChunks[data.key].push(data.value.buffer);

      if (data.index === data.size - 1) {
        console.log("store chunks chunks received", _this.storeChunks[data.key]); //レプリケーション

        k.keyValueList[data.key] = {
          chunks: _this.storeChunks[data.key]
        };
        (0, _kademlia.excuteEvent)(kad.onStore, {
          chunks: _this.storeChunks[data.key]
        });
        var mine = (0, _kadDistance.distance)(k.nodeId, data.key);
        var close = k.f.getCloseEstDist(data.key);

        if (mine > close) {
          console.log("store transfer", "\ndata", data, _this.storeChunks[data.key]);
          k.storeChunks(data.sender, data.key, _this.storeChunks[data.key]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwib25TdG9yZSIsImtleVZhbHVlTGlzdCIsIlNUT1JFX0NIVU5LUyIsImluZGV4Iiwic3RvcmVDaHVua3MiLCJidWZmZXIiLCJwdXNoIiwic2l6ZSIsImNodW5rcyIsIkZJTkRWQUxVRSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInRhcmdldEtleSIsInBlZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmREYXRhIiwiZm9yRWFjaCIsImNodW5rIiwiaSIsIkJ1ZmZlciIsImZyb20iLCJsZW5ndGgiLCJzZW5kIiwiRklORFZBTFVFX1IiLCJzdWNjZXNzIiwiaWRzIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiZmFpbCIsInRhcmdldE5vZGUiLCJ0byIsImNhbGxiYWNrIiwiX29uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsImFsbHBlZXIiLCJnZXRBbGxQZWVySWRzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJfb25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1lb3V0IiwicnBjIiwi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QUYsQ0FBUUMsUUFBbkIsRUFBNkI3RCxLQUE3Qjs7QUFqQ3NCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTVCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUNEOzs7Ozs7Ozs7Ozs7O3FCQUdRLEk7Ozs7O3NCQUNELEtBQUswRCxVQUFMLENBQWdCbkIsTUFBaEIsR0FBeUIsQzs7Ozs7QUFDckIwQixnQkFBQUEsRyxHQUFNLEtBQUtQLFVBQUwsQ0FBZ0IsQ0FBaEIsQztBQUNaaEUsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0I7QUFBRXNFLGtCQUFBQSxHQUFHLEVBQUhBO0FBQUYsaUJBQXRCLEVBQStCLEtBQUtQLFVBQXBDOzt1QkFDTU8sR0FBRyxFOzs7QUFDVCxxQkFBS1AsVUFBTCxDQUFnQlEsS0FBaEI7Ozs7Ozt1QkFFTSxJQUFJQyxPQUFKLENBQVksVUFBQUMsQ0FBQztBQUFBLHlCQUFJQyxVQUFVLENBQUNELENBQUQsRUFBSSxJQUFKLENBQWQ7QUFBQSxpQkFBYixDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFLSEUsRyxFQUFhQyxHLEVBQVU7QUFDOUI3RSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCMkUsR0FBdkIsRUFBNEJDLEdBQTVCOztBQUNBLFVBQUk1QyxNQUFNLENBQUNDLElBQVAsQ0FBWTFDLFNBQVosRUFBdUIyQyxRQUF2QixDQUFnQ3lDLEdBQWhDLENBQUosRUFBMEM7QUFDeENwRixRQUFBQSxTQUFTLENBQUNvRixHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhLCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4va2FkZW1saWFcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuLy8gaW1wb3J0IGJ1ZmZlcjJhYiBmcm9tIFwiYnVmZmVyLXRvLWFycmF5YnVmZmVyXCI7XG5cbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIHN0b3JlQ2h1bmtzOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIHN0b3JlXCIsIG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgY29uc3QgZGF0YTogU3RvcmVGb3JtYXQgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG4gICAgICBsZXQgaXNTZHAgPSBmYWxzZTtcbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuICAgICAgICAgIGlzU2RwID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrLnJlZlt0YXJnZXRdKTtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgaWYgKCFpc1NkcCkge1xuICAgICAgICAvLyAvL+OCreODvOOBjOihneeqgeOBl+OBquOBhOWJjeaPkFxuICAgICAgICAvLyBpZiAoIWsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSlcbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLm9uU3RvcmUsIGRhdGEudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFX0NIVU5LU10gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUNodW5rcyA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldID0gW107XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcInN0b3JlY2h1bmtzIGJ1ZmZlcjJhYlwiLCBkYXRhLnZhbHVlLmJ1ZmZlcik7XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGRhdGEudmFsdWUuYnVmZmVyKTtcblxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IGRhdGEuc2l6ZSAtIDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3MgY2h1bmtzIHJlY2VpdmVkXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0geyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH07XG5cbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLm9uU3RvcmUsIHsgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSB9KTtcblxuICAgICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJzdG9yZSB0cmFuc2ZlclwiLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICAgIGsuc3RvcmVDaHVua3MoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIGFycml2ZWRcIixcbiAgICAgICAgICAgIG1pbmUsXG4gICAgICAgICAgICBjbG9zZSxcbiAgICAgICAgICAgIFwiXFxuZGF0YVwiLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uZmluZHZhbHVlIGkgaGF2ZSB2YWx1ZVwiLCB7IHZhbHVlIH0pO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgbGV0IHNlbmREYXRhOiBGaW5kVmFsdWVSO1xuXG4gICAgICAgIGlmICh2YWx1ZS5jaHVua3MpIHtcbiAgICAgICAgICAvL+ODqeODvOOCuOODleOCoeOCpOODq1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlIHNlbmQgY2h1bmtzXCIpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgICAgICAgICBrZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHNlbmRkYXRhXCIsIHsgY2h1bmsgfSwgeyBzZW5kRGF0YSB9KTtcbiAgICAgICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksXG4gICAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy/jgrnjg6Ljg7zjg6vjg5XjgqHjgqTjg6tcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBGaW5kVmFsdWVSID0gbmV0d29yay5kYXRhO1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgclwiLCB7IGRhdGEgfSk7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJmaW5kdmFsdWUgciBjaHVua3MgYmYyYWJcIixcbiAgICAgICAgICBkYXRhLmNodW5rcyxcbiAgICAgICAgICBkYXRhLmNodW5rcy52YWx1ZS5idWZmZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUuYnVmZmVyKTtcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSBkYXRhLmNodW5rcy5zaXplIC0gMSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHJcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldKTtcbiAgICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmNodW5rcy5rZXldID0ge1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5mYWlsICYmIGRhdGEuZmFpbC50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuZmFpbC5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEuZmFpbC50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmROb2RlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBhc3luYyBwbGF5T2ZmZXJRdWV1ZSgpIHtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMub2ZmZXJRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpvYiA9IHRoaXMub2ZmZXJRdWV1ZVswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJkbyBqb2JcIiwgeyBqb2IgfSwgdGhpcy5vZmZlclF1ZXVlKTtcbiAgICAgICAgYXdhaXQgam9iKCk7XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwMDApKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNwb25zZShycGM6IHN0cmluZywgcmVxOiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=