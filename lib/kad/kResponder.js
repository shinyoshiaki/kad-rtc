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
                    k.ref[target].setSdp(data.value.sdp);
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
        }, _callee);
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
        var data, ids, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 6;

                _loop = function _loop() {
                  var key = _step.value;

                  _this.offerQueue.push(
                  /*#__PURE__*/
                  _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2() {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            console.log("offerque run", key);

                            if (!(key !== k.nodeId && !k.f.isNodeExist(key))) {
                              _context2.next = 4;
                              break;
                            }

                            _context2.next = 4;
                            return k.offer(key, network.nodeId).catch(console.log);

                          case 4:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }))); //ノードIDが見つかったらコールバック


                  if (k.state.findNode === key) {
                    k.callback._onFindNode(key);
                  }
                };

                for (_iterator = ids[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  _loop();
                } //初期動作のfindnodeでなければ


                _context3.next = 15;
                break;

              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3["catch"](6);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 15:
                _context3.prev = 15;
                _context3.prev = 16;

                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }

              case 18:
                _context3.prev = 18;

                if (!_didIteratorError) {
                  _context3.next = 21;
                  break;
                }

                throw _iteratorError;

              case 21:
                return _context3.finish(18);

              case 22:
                return _context3.finish(15);

              case 23:
                if (!(k.state.findNode !== k.nodeId)) {
                  _context3.next = 32;
                  break;
                }

                console.log("not found"); //ノードIDが見つからなければ

                if (ids.includes(k.state.findNode)) {
                  _context3.next = 32;
                  break;
                }

                //問い合わせ先を除外
                close = k.f.getCloseEstPeer(k.state.findNode, {
                  excludeId: network.nodeId
                });

                if (close) {
                  _context3.next = 29;
                  break;
                }

                return _context3.abrupt("return");

              case 29:
                console.log("findnode-r keep find node", k.state.findNode); //再探索

                _context3.next = 32;
                return k.findNode(k.state.findNode, close).catch(console.log);

              case 32:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[6, 11, 15, 23], [16,, 18, 22]]);
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

      function playOfferQueue() {
        return _playOfferQueue.apply(this, arguments);
      }

      return playOfferQueue;
    }()
  }, {
    key: "response",
    value: function response(rpc, req) {
      if (Object.keys(responder).includes(rpc)) {
        responder[rpc](req);
      }
    }
  }]);

  return KResponder;
}();

exports.default = KResponder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJjeXBoZXIiLCJkZWNyeXB0Iiwic2lnbiIsInB1YktleSIsImhhc2giLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV4Y2x1ZGVJZCIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldFNkcCIsImVycm9yIiwiZXZlbnRzIiwia2V5VmFsdWVMaXN0IiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsImJ1ZmZlciIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwiQnVmZmVyIiwiZnJvbSIsImxlbmd0aCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsInN1Y2Nlc3MiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJvZmZlciIsInN0YXRlIiwiZmluZE5vZGUiLCJfb25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1l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LEcsRUFBYUMsRyxFQUFVO0FBQzlCLFVBQUl6QyxNQUFNLENBQUNDLElBQVAsQ0FBWWhELFNBQVosRUFBdUJpRCxRQUF2QixDQUFnQ3NDLEdBQWhDLENBQUosRUFBMEM7QUFDeEN2RixRQUFBQSxTQUFTLENBQUN1RixHQUFELENBQVQsQ0FBZUMsR0FBZjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IEthZGVtbGlhLCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4va2FkZW1saWFcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbmV0d29yaywgU3RvcmVGb3JtYXQsIFN0b3JlQ2h1bmtzLCBGaW5kVmFsdWVSIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5cbmNvbnN0IHJlc3BvbmRlcjogYW55ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBvZmZlclF1ZXVlOiBBcnJheTxhbnk+ID0gW107XG4gIHN0b3JlQ2h1bmtzOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIGNvbnN0IGsgPSBrYWQ7XG4gICAgdGhpcy5wbGF5T2ZmZXJRdWV1ZSgpO1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBhc3luYyAobmV0d29yazogbmV0d29yaykgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlRm9ybWF0ID0gbmV0d29yay5kYXRhO1xuXG4gICAgICBpZiAoIShrLmN5cGhlci5kZWNyeXB0KGRhdGEuc2lnbiwgZGF0YS5wdWJLZXkpID09PSBkYXRhLmhhc2gpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW52YWxpZCBzdG9yZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvL+iHquWIhuOBqOmAgeS/oeWFg+OBrui3nembolxuICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAvL+iHquWIhuOBrmtidWNrZXRz5Lit44Gn6YCB5L+h5YWD44Gr5LiA55Wq6L+R44GE6Led6ZuiXG4gICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgaWYgKG1pbmUgPiBjbG9zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgICAgLy9zdG9yZeOBl+ebtOOBmVxuICAgICAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSwge1xuICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGFycml2ZWRcIiwgbWluZSwgY2xvc2UsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZGF0YS5zZW5kZXI7XG4gICAgICBsZXQgaXNTZHAgPSBmYWxzZTtcbiAgICAgIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlLnNkcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXMgc2lnbmFsaW5nXCIpO1xuICAgICAgICAgIGlzU2RwID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrLnJlZlt0YXJnZXRdKTtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRTZHAoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgaWYgKCFpc1NkcCkge1xuICAgICAgICBleGN1dGVFdmVudChrYWQuZXZlbnRzLnN0b3JlLCBkYXRhLnZhbHVlKTtcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5TVE9SRV9DSFVOS1NdID0gKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IFN0b3JlQ2h1bmtzID0gbmV0d29yay5kYXRhO1xuXG4gICAgICBpZiAoIShrLmN5cGhlci5kZWNyeXB0KGRhdGEuc2lnbiwgZGF0YS5wdWJLZXkpID09PSBkYXRhLmhhc2gpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW52YWxpZCBzdG9yZSBjaHVua3NcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwic3RvcmVjaHVua3MgYnVmZmVyMmFiXCIsIGRhdGEudmFsdWUuYnVmZmVyKTtcbiAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldLnB1c2goZGF0YS52YWx1ZS5idWZmZXIpO1xuXG4gICAgICBpZiAoZGF0YS5pbmRleCA9PT0gZGF0YS5zaXplIC0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rcyBjaHVua3MgcmVjZWl2ZWRcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0pO1xuICAgICAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSB7IGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gfTtcblxuICAgICAgICBleGN1dGVFdmVudChrYWQuZXZlbnRzLnN0b3JlLCB7IGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0gfSk7XG5cbiAgICAgICAgY29uc3QgbWluZSA9IGRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwic3RvcmUgdHJhbnNmZXJcIixcbiAgICAgICAgICAgIFwiXFxuZGF0YVwiLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldXG4gICAgICAgICAgKTtcbiAgICAgICAgICBrLnN0b3JlQ2h1bmtzKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV0sIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwic3RvcmUgYXJyaXZlZFwiLFxuICAgICAgICAgICAgbWluZSxcbiAgICAgICAgICAgIGNsb3NlLFxuICAgICAgICAgICAgXCJcXG5kYXRhXCIsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmtleV1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+OCv+ODvOOCsuODg+ODiOOBruOCreODvOOCkuaMgeOBo+OBpuOBhOOBn+OCiVxuICAgICAgaWYgKE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBrLmtleVZhbHVlTGlzdFtkYXRhLnRhcmdldEtleV07XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25maW5kdmFsdWUgaSBoYXZlIHZhbHVlXCIsIHsgdmFsdWUgfSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuXG4gICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICBsZXQgc2VuZERhdGE6IEZpbmRWYWx1ZVI7XG5cbiAgICAgICAgaWYgKHZhbHVlLmNodW5rcykge1xuICAgICAgICAgIC8v44Op44O844K444OV44Kh44Kk44OrXG4gICAgICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kdmFsdWUgc2VuZCBjaHVua3NcIik7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBhbnlbXSA9IHZhbHVlLmNodW5rcztcbiAgICAgICAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICBjaHVua3M6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICAgICAgICAgIGtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgc2VuZGRhdGFcIiwgeyBjaHVuayB9LCB7IHNlbmREYXRhIH0pO1xuICAgICAgICAgICAgcGVlci5zZW5kKFxuICAgICAgICAgICAgICBuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORFZBTFVFX1IsIHNlbmREYXRhKSxcbiAgICAgICAgICAgICAgXCJrYWRcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL+OCueODouODvOODq+ODleOCoeOCpOODq1xuICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgc3VjY2VzczogeyB2YWx1ZSwga2V5OiBkYXRhLnRhcmdldEtleSB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+OCreODvOOBq+acgOOCgui/keOBhOODlOOColxuICAgICAgICBjb25zdCBpZHMgPSBrLmYuZ2V0Q2xvc2VFc3RJZHNMaXN0KGRhdGEudGFyZ2V0S2V5KTtcbiAgICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmUgc2VuZCB2YWx1ZVwiKTtcbiAgICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlUiA9IHtcbiAgICAgICAgICAgIGZhaWw6IHtcbiAgICAgICAgICAgICAgaWRzOiBpZHMsXG4gICAgICAgICAgICAgIHRhcmdldE5vZGU6IGRhdGEudGFyZ2V0Tm9kZSxcbiAgICAgICAgICAgICAgdGFyZ2V0S2V5OiBkYXRhLnRhcmdldEtleSxcbiAgICAgICAgICAgICAgdG86IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORFZBTFVFX1JdID0gKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICBjb25zb2xlLmxvZyhcImZpbmR2YWx1ZSByXCIsIHsgZGF0YSB9KTtcbiAgICAgIC8vdmFsdWXjgpLnmbropovjgZfjgabjgYTjgozjgbBcbiAgICAgIGlmIChkYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgLy/pgJrluLjjg5XjgqHjgqTjg6tcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgZm91bmRcIik7XG4gICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKGRhdGEuc3VjY2Vzcy52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuc3VjY2Vzcy5rZXldID0gZGF0YS5zdWNjZXNzLnZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmNodW5rcykge1xuICAgICAgICAvL+ODqeODvOOCuOODleOCoeOCpOODq1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcImZpbmR2YWx1ZSByIGNodW5rcyBiZjJhYlwiLFxuICAgICAgICAgIGRhdGEuY2h1bmtzLFxuICAgICAgICAgIGRhdGEuY2h1bmtzLnZhbHVlLmJ1ZmZlclxuICAgICAgICApO1xuICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0ucHVzaChkYXRhLmNodW5rcy52YWx1ZS5idWZmZXIpO1xuICAgICAgICBpZiAoZGF0YS5jaHVua3MuaW5kZXggPT09IGRhdGEuY2h1bmtzLnNpemUgLSAxKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgclwiLCB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV0pO1xuICAgICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuY2h1bmtzLmtleV0gPSB7XG4gICAgICAgICAgICBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5jaHVua3Mua2V5XVxuICAgICAgICAgIH07XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kVmFsdWUoe1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkYXRhLmZhaWwgJiYgZGF0YS5mYWlsLnRvID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuRklORFZBTFVFX1IsIFwicmUgZmluZFwiLCBkYXRhKTtcbiAgICAgICAgLy/nmbropovjgafjgY3jgabjgYTjgarjgZHjgozjgbDlgJnoo5zjgavlr77jgZfjgablho3mjqLntKJcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5mYWlsLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS5mYWlsLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIiwgc2VuZERhdGEuY2xvc2VJRHMpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgb2YgaWRzKSB7XG4gICAgICAgIHRoaXMub2ZmZXJRdWV1ZS5wdXNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9mZmVycXVlIHJ1blwiLCBrZXkpO1xuICAgICAgICAgIGlmIChrZXkgIT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3Qoa2V5KSkge1xuICAgICAgICAgICAgLy9JROOBjOaOpee2muOBleOCjOOBpuOBhOOBquOBhOOCguOBruOBquOCieaOpee2muOBmeOCi1xuICAgICAgICAgICAgYXdhaXQgay5vZmZlcihrZXksIG5ldHdvcmsubm9kZUlkKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OBo+OBn+OCieOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgICBpZiAoay5zdGF0ZS5maW5kTm9kZSA9PT0ga2V5KSB7XG4gICAgICAgICAgay5jYWxsYmFjay5fb25GaW5kTm9kZShrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgYXdhaXQgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHBsYXlPZmZlclF1ZXVlKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5vZmZlclF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgam9iID0gdGhpcy5vZmZlclF1ZXVlWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcImRvIGpvYlwiLCB7IGpvYiB9LCB0aGlzLm9mZmVyUXVldWUpO1xuICAgICAgICBhd2FpdCBqb2IoKTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc3BvbnNlKHJwYzogc3RyaW5nLCByZXE6IGFueSkge1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmRlcltycGNdKHJlcSk7XG4gICAgfVxuICB9XG59XG4iXX0=