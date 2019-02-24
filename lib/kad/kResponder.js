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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwia2FkIiwiayIsInBsYXlPZmZlclF1ZXVlIiwiZGVmIiwiU1RPUkUiLCJuZXR3b3JrIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsImRhdGEiLCJjeXBoZXIiLCJkZWNyeXB0Iiwic2lnbiIsInB1YktleSIsImhhc2giLCJtaW5lIiwia2V5IiwiY2xvc2UiLCJmIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV4Y2x1ZGVJZCIsInRhcmdldCIsImlzU2RwIiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldFNkcCIsImVycm9yIiwiZXZlbnRzIiwia2V5VmFsdWVMaXN0IiwiU1RPUkVfQ0hVTktTIiwiaW5kZXgiLCJzdG9yZUNodW5rcyIsImJ1ZmZlciIsInB1c2giLCJzaXplIiwiY2h1bmtzIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJmb3JFYWNoIiwiY2h1bmsiLCJpIiwiQnVmZmVyIiwiZnJvbSIsImxlbmd0aCIsInNlbmQiLCJGSU5EVkFMVUVfUiIsInN1Y2Nlc3MiLCJpZHMiLCJnZXRDbG9zZUVzdElkc0xpc3QiLCJmYWlsIiwidGFyZ2V0Tm9kZSIsInRvIiwiY2FsbGJhY2siLCJfb25GaW5kVmFsdWUiLCJpZCIsImRvRmluZHZhbHVlIiwiRklORE5PREUiLCJjbG9zZUlEcyIsImdldENsb3NlSURzIiwiYWxscGVlciIsImdldEFsbFBlZXJJZHMiLCJGSU5ETk9ERV9SIiwib2ZmZXJRdWV1ZSIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsIl9vbkZpbmROb2RlIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiam9iIiwic2hp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QUFwQzs7dUJBQ01NLEdBQUcsRTs7O0FBQ1QscUJBQUtOLFVBQUwsQ0FBZ0JPLEtBQWhCOzs7Ozs7dUJBRU0sSUFBSUMsT0FBSixDQUFZLFVBQUFDLENBQUM7QUFBQSx5QkFBSUMsVUFBVSxDQUFDRCxDQUFELEVBQUksSUFBSixDQUFkO0FBQUEsaUJBQWIsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBS0hFLEcsRUFBYUMsRyxFQUFVO0FBQzlCbEYsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksU0FBWixFQUF1QmdGLEdBQXZCLEVBQTRCQyxHQUE1Qjs7QUFDQSxVQUFJM0MsTUFBTSxDQUFDQyxJQUFQLENBQVloRCxTQUFaLEVBQXVCaUQsUUFBdkIsQ0FBZ0N3QyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDekYsUUFBQUEsU0FBUyxDQUFDeUYsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSwgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuL2thZGVtbGlhXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG5ldHdvcmssIFN0b3JlRm9ybWF0LCBTdG9yZUNodW5rcywgRmluZFZhbHVlUiB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuXG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgb2ZmZXJRdWV1ZTogQXJyYXk8YW55PiA9IFtdO1xuICBzdG9yZUNodW5rczogeyBba2V5OiBzdHJpbmddOiBhbnlbXSB9ID0ge307XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICBjb25zdCBrID0ga2FkO1xuICAgIHRoaXMucGxheU9mZmVyUXVldWUoKTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVdID0gYXN5bmMgKG5ldHdvcms6IG5ldHdvcmspID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcblxuICAgICAgaWYgKCEoay5jeXBoZXIuZGVjcnlwdChkYXRhLnNpZ24sIGRhdGEucHViS2V5KSA9PT0gZGF0YS5oYXNoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImludmFsaWQgc3RvcmVcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy/oh6rliIbjgajpgIHkv6HlhYPjga7ot53pm6JcbiAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgLy/oh6rliIbjga5rYnVja2V0c+S4reOBp+mAgeS/oeWFg+OBq+S4gOeVqui/keOBhOi3nembolxuICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3REaXN0KGRhdGEua2V5KTtcbiAgICAgIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSB0cmFuc2ZlclwiLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICAgIC8vc3RvcmXjgZfnm7TjgZlcbiAgICAgICAgay5zdG9yZShkYXRhLnNlbmRlciwgZGF0YS5rZXksIGRhdGEudmFsdWUsIHtcbiAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuICAgICAgbGV0IGlzU2RwID0gZmFsc2U7XG4gICAgICBpZiAoZGF0YS5rZXkgPT09IGsubm9kZUlkICYmICFrLmYuaXNOb2RlRXhpc3QodGFyZ2V0KSkge1xuICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcbiAgICAgICAgICBpc1NkcCA9IHRydWU7XG4gICAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwib2ZmZXJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgICAuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpXG4gICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBhbnN3ZXJcIiwgZGF0YS5zZW5kZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coay5yZWZbdGFyZ2V0XSk7XG4gICAgICAgICAgICAgIGsucmVmW3RhcmdldF0uc2V0U2RwKGRhdGEudmFsdWUuc2RwKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgIGlmICghaXNTZHApIHtcbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLmV2ZW50cy5zdG9yZSwgZGF0YS52YWx1ZSk7XG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuU1RPUkVfQ0hVTktTXSA9IChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUNodW5rcyA9IG5ldHdvcmsuZGF0YTtcblxuICAgICAgaWYgKCEoay5jeXBoZXIuZGVjcnlwdChkYXRhLnNpZ24sIGRhdGEucHViS2V5KSA9PT0gZGF0YS5oYXNoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImludmFsaWQgc3RvcmUgY2h1bmtzXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldID0gW107XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcInN0b3JlY2h1bmtzIGJ1ZmZlcjJhYlwiLCBkYXRhLnZhbHVlLmJ1ZmZlcik7XG4gICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XS5wdXNoKGRhdGEudmFsdWUuYnVmZmVyKTtcblxuICAgICAgaWYgKGRhdGEuaW5kZXggPT09IGRhdGEuc2l6ZSAtIDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3MgY2h1bmtzIHJlY2VpdmVkXCIsIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0geyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH07XG5cbiAgICAgICAgZXhjdXRlRXZlbnQoa2FkLmV2ZW50cy5zdG9yZSwgeyBjaHVua3M6IHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldIH0pO1xuXG4gICAgICAgIGNvbnN0IG1pbmUgPSBkaXN0YW5jZShrLm5vZGVJZCwgZGF0YS5rZXkpO1xuICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdERpc3QoZGF0YS5rZXkpO1xuICAgICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIHRyYW5zZmVyXCIsXG4gICAgICAgICAgICBcIlxcbmRhdGFcIixcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEua2V5XVxuICAgICAgICAgICk7XG4gICAgICAgICAgay5zdG9yZUNodW5rcyhkYXRhLnNlbmRlciwgZGF0YS5rZXksIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldLCB7XG4gICAgICAgICAgICBleGNsdWRlSWQ6IG5ldHdvcmsubm9kZUlkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcInN0b3JlIGFycml2ZWRcIixcbiAgICAgICAgICAgIG1pbmUsXG4gICAgICAgICAgICBjbG9zZSxcbiAgICAgICAgICAgIFwiXFxuZGF0YVwiLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHRoaXMuc3RvcmVDaHVua3NbZGF0YS5rZXldXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uZmluZHZhbHVlIGkgaGF2ZSB2YWx1ZVwiLCB7IHZhbHVlIH0pO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcblxuICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgbGV0IHNlbmREYXRhOiBGaW5kVmFsdWVSO1xuXG4gICAgICAgIGlmICh2YWx1ZS5jaHVua3MpIHtcbiAgICAgICAgICAvL+ODqeODvOOCuOODleOCoeOCpOODq1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlIHNlbmQgY2h1bmtzXCIpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogYW55W10gPSB2YWx1ZS5jaHVua3M7XG4gICAgICAgICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgY2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgICAgICAgICBrZXk6IGRhdGEudGFyZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHNlbmRkYXRhXCIsIHsgY2h1bmsgfSwgeyBzZW5kRGF0YSB9KTtcbiAgICAgICAgICAgIHBlZXIuc2VuZChcbiAgICAgICAgICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksXG4gICAgICAgICAgICAgIFwia2FkXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy/jgrnjg6Ljg7zjg6vjg5XjgqHjgqTjg6tcbiAgICAgICAgICBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBuZXR3b3JrKSA9PiB7XG4gICAgICBjb25zdCBkYXRhOiBGaW5kVmFsdWVSID0gbmV0d29yay5kYXRhO1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kdmFsdWUgclwiLCB7IGRhdGEgfSk7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIC8v6YCa5bi444OV44Kh44Kk44OrXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZShkYXRhLnN1Y2Nlc3MudmFsdWUpO1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLnN1Y2Nlc3Mua2V5XSA9IGRhdGEuc3VjY2Vzcy52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5jaHVua3MpIHtcbiAgICAgICAgLy/jg6njg7zjgrjjg5XjgqHjgqTjg6tcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJmaW5kdmFsdWUgciBjaHVua3MgYmYyYWJcIixcbiAgICAgICAgICBkYXRhLmNodW5rcyxcbiAgICAgICAgICBkYXRhLmNodW5rcy52YWx1ZS5idWZmZXJcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldLnB1c2goZGF0YS5jaHVua3MudmFsdWUuYnVmZmVyKTtcbiAgICAgICAgaWYgKGRhdGEuY2h1bmtzLmluZGV4ID09PSBkYXRhLmNodW5rcy5zaXplIC0gMSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIHJcIiwgdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldKTtcbiAgICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmNodW5rcy5rZXldID0ge1xuICAgICAgICAgICAgY2h1bmtzOiB0aGlzLnN0b3JlQ2h1bmtzW2RhdGEuY2h1bmtzLmtleV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGsuY2FsbGJhY2suX29uRmluZFZhbHVlKHtcbiAgICAgICAgICAgIGNodW5rczogdGhpcy5zdG9yZUNodW5rc1tkYXRhLmNodW5rcy5rZXldXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5mYWlsICYmIGRhdGEuZmFpbC50byA9PT0gay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIiwgZGF0YSk7XG4gICAgICAgIC8v55m66KaL44Gn44GN44Gm44GE44Gq44GR44KM44Gw5YCZ6KOc44Gr5a++44GX44Gm5YaN5o6i57SiXG4gICAgICAgIGZvciAobGV0IGlkIGluIGRhdGEuZmFpbC5pZHMpIHtcbiAgICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKGlkKTtcbiAgICAgICAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAgICAgICBrLmRvRmluZHZhbHVlKGRhdGEuZmFpbC50YXJnZXRLZXksIHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVdID0gKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/opoHmsYLjgZXjgozjgZ/jgq3jg7zjgavov5HjgYTopIfmlbDjga7jgq3jg7zjgpLpgIHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuXG4gICAgICBjb25zb2xlLmxvZyhuZXR3b3JrLm5vZGVJZCwge1xuICAgICAgICBhbGxwZWVyOiBrLmYuZ2V0QWxsUGVlcklkcygpLFxuICAgICAgICBpZHM6IHNlbmREYXRhLmNsb3NlSURzXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcGVlciA9IGsuZi5nZXRQZWVyRnJvbW5vZGVJZChuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRiYWNrIGZpbmRub2RlXCIsIHNlbmREYXRhLmNsb3NlSURzKTtcbiAgICAgICAgLy/pgIHjgorov5TjgZlcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5ETk9ERV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkROT0RFX1JdID0gYXN5bmMgKG5ldHdvcms6IGFueSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v5biw44Gj44Gm44GN44Gf6KSH5pWw44GuSURcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEuY2xvc2VJRHM7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICAgICAgZm9yIChsZXQga2V5IGluIGlkcykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBpZHNba2V5XTtcbiAgICAgICAgdGhpcy5vZmZlclF1ZXVlLnB1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib2ZmZXJxdWUgcnVuXCIsIHRhcmdldCk7XG4gICAgICAgICAgaWYgKHRhcmdldCAhPT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAvL0lE44GM5o6l57aa44GV44KM44Gm44GE44Gq44GE44KC44Gu44Gq44KJ5o6l57aa44GZ44KLXG4gICAgICAgICAgICBhd2FpdCBrLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44Gj44Gf44KJ44Kz44O844Or44OQ44OD44KvXG4gICAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlID09PSB0YXJnZXQpIHtcbiAgICAgICAgICBrLmNhbGxiYWNrLl9vbkZpbmROb2RlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy/liJ3mnJ/li5XkvZzjga5maW5kbm9kZeOBp+OBquOBkeOCjOOBsFxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGZvdW5kXCIpO1xuICAgICAgICAvL+ODjuODvOODiUlE44GM6KaL44Gk44GL44KJ44Gq44GR44KM44GwXG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgLy/llY/jgYTlkIjjgo/jgZvlhYjjgpLpmaTlpJZcbiAgICAgICAgICBjb25zdCBjbG9zZSA9IGsuZi5nZXRDbG9zZUVzdFBlZXIoay5zdGF0ZS5maW5kTm9kZSwge1xuICAgICAgICAgICAgZXhjbHVkZUlkOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgLy/lho3mjqLntKJcbiAgICAgICAgICBhd2FpdCBrLmZpbmROb2RlKGsuc3RhdGUuZmluZE5vZGUsIGNsb3NlKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19