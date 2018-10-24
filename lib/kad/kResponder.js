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

    responder[_KConst.default.FINDVALUE] = function (network) {
      console.log("on findvalue", network.nodeId);
      var data = network.data; //ターゲットのキーを持っていたら

      if (Object.keys(k.keyValueList).includes(data.targetKey)) {
        var value = k.keyValueList[data.targetKey];
        var peer = k.f.getPeerFromnodeId(network.nodeId); //キーを見つかったというメッセージを戻す

        if (!peer) return;
        var sendData = {
          success: {
            value: value,
            key: data.targetKey
          }
        };
        peer.send((0, _KConst.networkFormat)(k.nodeId, _KConst.default.FINDVALUE_R, sendData), "kad");
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
        console.log("findvalue found");
        k.callback.onFindValue(data.success.value); //レプリケーション

        k.keyValueList[data.success.key] = data.success.value;
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
        var data, ids, _loop, key, close;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = network.data; //帰ってきた複数のID

                ids = data.closeIDs;
                console.log("on findnode-r", ids);

                _loop = function _loop(key) {
                  var target = ids[key];

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

                for (key in ids) {
                  _loop(key);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJrYWQiLCJrIiwicGxheU9mZmVyUXVldWUiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiZGF0YSIsIm1pbmUiLCJrZXkiLCJjbG9zZSIsImYiLCJnZXRDbG9zZUVzdERpc3QiLCJzdG9yZSIsInNlbmRlciIsInZhbHVlIiwia2V5VmFsdWVMaXN0IiwiY2FsbGJhY2siLCJvblN0b3JlIiwidGFyZ2V0IiwiaXNOb2RlRXhpc3QiLCJzZHAiLCJ0eXBlIiwiYW5zd2VyIiwicHJveHkiLCJjYXRjaCIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiRklORFZBTFVFIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwidGFyZ2V0S2V5IiwicGVlciIsImdldFBlZXJGcm9tbm9kZUlkIiwic2VuZERhdGEiLCJzdWNjZXNzIiwic2VuZCIsIkZJTkRWQUxVRV9SIiwiaWRzIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiZmFpbCIsInRhcmdldE5vZGUiLCJ0byIsIm9uRmluZFZhbHVlIiwiaWQiLCJkb0ZpbmR2YWx1ZSIsIkZJTkROT0RFIiwiY2xvc2VJRHMiLCJnZXRDbG9zZUlEcyIsImFsbHBlZXIiLCJnZXRBbGxQZWVySWRzIiwiRklORE5PREVfUiIsIm9mZmVyUXVldWUiLCJwdXNoIiwib2ZmZXIiLCJzdGF0ZSIsImZpbmROb2RlIiwib25GaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsImxlbmd0aCIsImpvYiIsInNoaWZ0IiwiUHJvbWlzZSIsInIiLCJzZXRUaW1lb3V0IiwicnBjIiwicmVxIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBR0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxJQUFJLEdBQUcsSUFBSUMsVUFBSixFQUFiO0FB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QUFaLEVBQXVCb0MsUUFBdkIsQ0FBZ0NvQyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDeEUsUUFBQUEsU0FBUyxDQUFDd0UsR0FBRCxDQUFULENBQWVDLEdBQWY7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5jb25zdCByZXNwb25kZXI6IGFueSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLUmVzcG9uZGVyIHtcbiAgb2ZmZXJRdWV1ZTogQXJyYXk8YW55PiA9IFtdO1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgY29uc3QgayA9IGthZDtcbiAgICB0aGlzLnBsYXlPZmZlclF1ZXVlKCk7XG5cbiAgICByZXNwb25kZXJbZGVmLlNUT1JFXSA9IGFzeW5jIChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gc3RvcmVcIiwgbmV0d29yay5ub2RlSWQpO1xuXG4gICAgICBjb25zdCBkYXRhOiBTdG9yZUZvcm1hdCA9IG5ldHdvcmsuZGF0YTtcbiAgICAgIC8v6Ieq5YiG44Go6YCB5L+h5YWD44Gu6Led6ZuiXG4gICAgICBjb25zdCBtaW5lID0gZGlzdGFuY2Uoay5ub2RlSWQsIGRhdGEua2V5KTtcbiAgICAgIC8v6Ieq5YiG44Gua2J1Y2tldHPkuK3jgafpgIHkv6HlhYPjgavkuIDnlarov5HjgYTot53pm6JcbiAgICAgIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gICAgICBpZiAobWluZSA+IGNsb3NlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgdHJhbnNmZXJcIiwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL3N0b3Jl44GX55u044GZXG4gICAgICAgIGsuc3RvcmUoZGF0YS5zZW5kZXIsIGRhdGEua2V5LCBkYXRhLnZhbHVlKTtcbiAgICAgICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICAgICAgay5rZXlWYWx1ZUxpc3RbZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgYXJyaXZlZFwiLCBtaW5lLCBjbG9zZSwgXCJcXG5kYXRhXCIsIGRhdGEpO1xuICAgICAgICAvL+WPl+OBkeWPluOCi1xuICAgICAgICBrLmtleVZhbHVlTGlzdFtkYXRhLmtleV0gPSBkYXRhLnZhbHVlO1xuICAgICAgICBrLmNhbGxiYWNrLm9uU3RvcmUoay5rZXlWYWx1ZUxpc3QpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBkYXRhLnNlbmRlcjtcblxuICAgICAgaWYgKGRhdGEua2V5ID09PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpcyBzaWduYWxpbmdcIik7XG5cbiAgICAgICAgICBpZiAoZGF0YS52YWx1ZS5zZHAudHlwZSA9PT0gXCJvZmZlclwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImthZCByZWNlaXZlZCBvZmZlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICBhd2FpdCBrXG4gICAgICAgICAgICAgIC5hbnN3ZXIodGFyZ2V0LCBkYXRhLnZhbHVlLnNkcCwgZGF0YS52YWx1ZS5wcm94eSlcbiAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudmFsdWUuc2RwLnR5cGUgPT09IFwiYW5zd2VyXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhrLnJlZlt0YXJnZXRdKTtcbiAgICAgICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmR2YWx1ZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7jgq3jg7zjgpLmjIHjgaPjgabjgYTjgZ/jgolcbiAgICAgIGlmIChPYmplY3Qua2V5cyhrLmtleVZhbHVlTGlzdCkuaW5jbHVkZXMoZGF0YS50YXJnZXRLZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgICAgLy/jgq3jg7zjgpLopovjgaTjgYvjgaPjgZ/jgajjgYTjgYbjg6Hjg4Pjgrvjg7zjgrjjgpLmiLvjgZlcbiAgICAgICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWVSID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHsgdmFsdWUsIGtleTogZGF0YS50YXJnZXRLZXkgfVxuICAgICAgICB9O1xuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgq3jg7zjgavmnIDjgoLov5HjgYTjg5TjgqJcbiAgICAgICAgY29uc3QgaWRzID0gay5mLmdldENsb3NlRXN0SWRzTGlzdChkYXRhLnRhcmdldEtleSk7XG4gICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlIHNlbmQgdmFsdWVcIik7XG4gICAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZVIgPSB7XG4gICAgICAgICAgICBmYWlsOiB7XG4gICAgICAgICAgICAgIGlkczogaWRzLFxuICAgICAgICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5GSU5EVkFMVUVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXNwb25kZXJbZGVmLkZJTkRWQUxVRV9SXSA9IChuZXR3b3JrOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGRhdGE6IEZpbmRWYWx1ZVIgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL3ZhbHVl44KS55m66KaL44GX44Gm44GE44KM44GwXG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmluZHZhbHVlIGZvdW5kXCIpO1xuICAgICAgICBrLmNhbGxiYWNrLm9uRmluZFZhbHVlKGRhdGEuc3VjY2Vzcy52YWx1ZSk7XG4gICAgICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgICAgIGsua2V5VmFsdWVMaXN0W2RhdGEuc3VjY2Vzcy5rZXldID0gZGF0YS5zdWNjZXNzLnZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmZhaWwgJiYgZGF0YS5mYWlsLnRvID09PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuRklORFZBTFVFX1IsIFwicmUgZmluZFwiLCBkYXRhKTtcbiAgICAgICAgLy/nmbropovjgafjgY3jgabjgYTjgarjgZHjgozjgbDlgJnoo5zjgavlr77jgZfjgablho3mjqLntKJcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5mYWlsLmlkcykge1xuICAgICAgICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQoaWQpO1xuICAgICAgICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgICAgICAgIGsuZG9GaW5kdmFsdWUoZGF0YS5mYWlsLnRhcmdldEtleSwgcGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gICAgICAvL+imgeaxguOBleOCjOOBn+OCreODvOOBq+i/keOBhOikh+aVsOOBruOCreODvOOCkumAgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IGNsb3NlSURzOiBrLmYuZ2V0Q2xvc2VJRHMoZGF0YS50YXJnZXRLZXkpIH07XG5cbiAgICAgIGNvbnNvbGUubG9nKG5ldHdvcmsubm9kZUlkLCB7XG4gICAgICAgIGFsbHBlZXI6IGsuZi5nZXRBbGxQZWVySWRzKCksXG4gICAgICAgIGlkczogc2VuZERhdGEuY2xvc2VJRHNcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwZWVyID0gay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGJhY2sgZmluZG5vZGVcIiwgc2VuZERhdGEuY2xvc2VJRHMpO1xuICAgICAgICAvL+mAgeOCiui/lOOBmVxuICAgICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkROT0RFX1IsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlc3BvbmRlcltkZWYuRklORE5PREVfUl0gPSBhc3luYyAobmV0d29yazogYW55KSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICAgICAgLy/luLDjgaPjgabjgY3jgZ/opIfmlbDjga5JRFxuICAgICAgY29uc3QgaWRzID0gZGF0YS5jbG9zZUlEcztcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZmluZG5vZGUtclwiLCBpZHMpO1xuXG4gICAgICBmb3IgKGxldCBrZXkgaW4gaWRzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGlkc1trZXldO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUucHVzaChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvZmZlcnF1ZSBydW5cIiwgdGFyZ2V0KTtcbiAgICAgICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIC8vSUTjgYzmjqXntprjgZXjgozjgabjgYTjgarjgYTjgoLjga7jgarjgonmjqXntprjgZnjgotcbiAgICAgICAgICAgIGF3YWl0IGsub2ZmZXIodGFyZ2V0LCBuZXR3b3JrLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8v44OO44O844OJSUTjgYzopovjgaTjgYvjgaPjgZ/jgonjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgPT09IHRhcmdldCkge1xuICAgICAgICAgIGsuY2FsbGJhY2sub25GaW5kTm9kZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8v5Yid5pyf5YuV5L2c44GuZmluZG5vZGXjgafjgarjgZHjgozjgbBcbiAgICAgIGlmIChrLnN0YXRlLmZpbmROb2RlICE9PSBrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBmb3VuZFwiKTtcbiAgICAgICAgLy/jg47jg7zjg4lJROOBjOimi+OBpOOBi+OCieOBquOBkeOCjOOBsFxuICAgICAgICBpZiAoIWlkcy5pbmNsdWRlcyhrLnN0YXRlLmZpbmROb2RlKSkge1xuICAgICAgICAgIC8v5ZWP44GE5ZCI44KP44Gb5YWI44KS6Zmk5aSWXG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZS1yIGtlZXAgZmluZCBub2RlXCIsIGsuc3RhdGUuZmluZE5vZGUpO1xuICAgICAgICAgIC8v5YaN5o6i57SiXG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcGxheU9mZmVyUXVldWUoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm9mZmVyUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqb2IgPSB0aGlzLm9mZmVyUXVldWVbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZG8gam9iXCIsIHsgam9iIH0sIHRoaXMub2ZmZXJRdWV1ZSk7XG4gICAgICAgIGF3YWl0IGpvYigpO1xuICAgICAgICB0aGlzLm9mZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzcG9uc2UocnBjOiBzdHJpbmcsIHJlcTogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgcnBjXCIsIHJwYywgcmVxKTtcbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uZGVyKS5pbmNsdWRlcyhycGMpKSB7XG4gICAgICByZXNwb25kZXJbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxufVxuIl19