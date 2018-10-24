"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kUtil = _interopRequireDefault(require("./kUtil"));

var _kResponder = _interopRequireDefault(require("./kResponder"));

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kadDistance = require("kad-distance");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require("babel-polyfill");

var Kademlia =
/*#__PURE__*/
function () {
  function Kademlia(_nodeId, opt) {
    _classCallCheck(this, Kademlia);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "k", void 0);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "f", void 0);

    _defineProperty(this, "responder", void 0);

    _defineProperty(this, "dataList", []);

    _defineProperty(this, "keyValueList", {});

    _defineProperty(this, "ref", {});

    _defineProperty(this, "buffer", {});

    _defineProperty(this, "state", {
      isOffer: false,
      findNode: "",
      hash: {},
      maintain: false
    });

    _defineProperty(this, "onPing", {});

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onFindValue: function onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onStore: function onStore(v) {},
      _onPing: this.onPing,
      onApp: function onApp(v) {}
    });

    console.log("start kad", _nodeId);
    this.k = 20;
    if (opt) if (opt.kLength) this.k = opt.kLength;
    this.nodeId = _nodeId;
    this.kbuckets = new Array(160);

    for (var i = 0; i < 160; i++) {
      var kbucket = [];
      this.kbuckets[i] = kbucket;
    }

    this.f = new _kUtil.default(this.k, this.kbuckets);
    this.responder = new _kResponder.default(this);
  }

  _createClass(Kademlia, [{
    key: "ping",
    value: function ping(peer) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        console.log("ping", peer.nodeId); //10秒以内にpingのフラグが立てば成功

        var timeout = setTimeout(function () {
          console.log("ping fail", peer.nodeId);
          peer.isDisconnected = true;

          _this.f.cleanDiscon();

          _this.callback.onPeerDisconnect(_this.kbuckets);

          reject("ping timeout " + peer.nodeId);
        }, 10 * 1000); //ping完了時のコールバック

        _this.callback._onPing[peer.nodeId] = function () {
          console.log("ping success", peer.nodeId);
          clearTimeout(timeout);
          resolve(true);
        }; //自分のノードIDを含める


        var sendData = {
          target: peer.nodeId
        }; //pingを送る

        peer.send((0, _KConst.networkFormat)(_this.nodeId, _KConst.default.PING, sendData), "kad");
      });
    }
  }, {
    key: "store",
    value: function () {
      var _store = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sender, key, value) {
        var peer, storeFormat;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                //自分に一番近いピアを取得
                peer = this.f.getCloseEstPeer(key);

                if (peer) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
                storeFormat = {
                  sender: sender,
                  key: key,
                  value: value
                };
                peer.send(JSON.stringify(storeFormat), "kad");
                console.log("store done", storeFormat);
                this.keyValueList[key] = value;

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function store(_x, _x2, _x3) {
        return _store.apply(this, arguments);
      };
    }()
  }, {
    key: "findNode",
    value: function () {
      var _findNode = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(targetId, peer) {
        var ping, sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("findnode"); //接続確認

                ping = this.ping(peer).catch(console.log);

                if (ping) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return");

              case 4:
                console.log("findnode", targetId);
                this.state.findNode = targetId;
                sendData = {
                  targetKey: targetId
                }; //送る

                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function findNode(_x4, _x5) {
        return _findNode.apply(this, arguments);
      };
    }()
  }, {
    key: "findValue",
    value: function findValue(key) {
      var _this2 = this;

      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得

      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        _this2.doFindvalue(key, peer);
      }); // const peer = this.f.getCloseEstPeer(key);
      // if (!peer) return;
      // this.doFindvalue(key, peer);
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, peer) {
        var findvalue;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                findvalue = {
                  targetKey: key
                };
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, findvalue), "kad");

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function doFindvalue(_x6, _x7) {
        return _doFindvalue.apply(this, arguments);
      };
    }()
  }, {
    key: "addknode",
    value: function addknode(peer) {
      var _this3 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this3.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this3.f.cleanDiscon();

        _this3.callback.onAddPeer(_this3.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this3.findNewPeer(peer);
        }, 1000);
        this.callback.onAddPeer(this.f.getAllPeerIds());
      }
    }
  }, {
    key: "findNewPeer",
    value: function findNewPeer(peer) {
      if (this.f.getKbucketNum() < this.k) {
        //自身のノードIDをkeyとしてFIND_NODE
        this.findNode(this.nodeId, peer);
      } else {
        console.log("kbucket ready", this.f.getKbucketNum());
      }
    }
  }, {
    key: "onRequest",
    value: function onRequest(datalink) {
      var network = JSON.parse(datalink);
      this.responder.response(network.type, network);
      if (!this.state.maintain) this.maintain(network);
    }
  }, {
    key: "maintain",
    value: function () {
      var _maintain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(network) {
        var inx, kbucket, result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                inx = (0, _kadDistance.distance)(this.nodeId, network.nodeId);
                kbucket = this.kbuckets[inx]; //送信元が該当するk-bucketの中にあった場合
                //そのノードをk-bucketの末尾に移す

                kbucket.forEach(function (peer, i) {
                  if (peer.nodeId === network.nodeId) {
                    console.log("maintain", "Moves it to the tail of the list");
                    kbucket.splice(i, 1);
                    kbucket.push(peer);
                    return 0;
                  }
                }); //k-bucketがすでに満杯な場合、
                //そのk-bucket中の先頭のノードがオンラインなら先頭のノードを残す

                if (!(kbucket.length > this.k)) {
                  _context4.next = 11;
                  break;
                }

                this.state.maintain = true;
                console.log("maintain", "bucket fulled", network.nodeId);
                _context4.next = 8;
                return this.ping(kbucket[0]).catch(console.log);

              case 8:
                result = _context4.sent;
                this.state.maintain = false;

                if (!result) {
                  kbucket.splice(0, 1);
                }

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function maintain(_x8) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this4 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this4.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this4.store(_this4.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this4.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var r = _this5.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this5.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var storeFormat = {
            sender: _this5.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send(JSON.stringify(storeFormat), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this5.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "send",
    value: function send(target, data) {
      var _ = this.f.getPeerFromnodeId(target);

      if (_) _.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.SEND, data), "kad");
    }
  }, {
    key: "onCommand",
    value: function onCommand(message) {
      switch (message.label) {
        case "kad":
          var dataLink = message.data;

          try {
            console.log("oncommand kad", {
              message: message
            });
            var networkLayer = JSON.parse(dataLink);

            if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
              this.dataList.push(networkLayer.hash);
              this.onRequest(dataLink);
            }
          } catch (error) {
            console.log(error);
          }

          break;

        case "app":
          console.log("kad onapp", message.data);
          this.callback.onApp(JSON.parse(message.data));
          break;

        case "bin":
          try {
            var json = JSON.parse(message.data);

            if (json.type === "start") {
              this.buffer[message.nodeId] = [];
            } else if (json.type === "end") {}
          } catch (error) {
            if (!this.buffer[message.nodeId]) {
              this.buffer[message.nodeId] = [];
            }

            this.buffer[message.nodeId].push(message.data);
          }

          break;
      }
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJtYWludGFpbiIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIl9vblBpbmciLCJvblBpbmciLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwicGVlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJpc0Rpc2Nvbm5lY3RlZCIsImNsZWFuRGlzY29uIiwiY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJzZW5kRGF0YSIsInRhcmdldCIsInNlbmQiLCJkZWYiLCJQSU5HIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJnZXRDbG9zZUVzdFBlZXIiLCJTVE9SRSIsInN0b3JlRm9ybWF0IiwiSlNPTiIsInN0cmluZ2lmeSIsImtleVZhbHVlTGlzdCIsInRhcmdldElkIiwicGluZyIsImNhdGNoIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZm9yRWFjaCIsImRvRmluZHZhbHVlIiwiZmluZHZhbHVlIiwiRklORFZBTFVFIiwiZXZlbnRzIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiZGF0YWxpbmsiLCJuZXR3b3JrIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJpbngiLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJqc29uIiwiYnVmZmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLFE7OztBQTZCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBdkJsQyxFQXVCa0M7O0FBQUEsMENBdEJsQixFQXNCa0I7O0FBQUEsaUNBckJ4QixFQXFCd0I7O0FBQUEsb0NBcEJqQixFQW9CaUI7O0FBQUEsbUNBbkJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUUsRUFIQTtBQUlOQyxNQUFBQSxRQUFRLEVBQUU7QUFKSixLQW1CaUQ7O0FBQUEsb0NBWlQsRUFZUzs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9B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bFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge30sXG4gICAgbWFpbnRhaW46IGZhbHNlXG4gIH07XG5cbiAgcHJpdmF0ZSBvblBpbmc6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25QaW5nOiB0aGlzLm9uUGluZyxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHBpbmcocGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGluZ1wiLCBwZWVyLm5vZGVJZCk7XG5cbiAgICAgIC8vMTDnp5Lku6XlhoXjgatwaW5n44Gu44OV44Op44Kw44GM56uL44Gm44Gw5oiQ5YqfXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uUGVlckRpc2Nvbm5lY3QodGhpcy5rYnVja2V0cyk7XG4gICAgICAgIHJlamVjdChcInBpbmcgdGltZW91dCBcIiArIHBlZXIubm9kZUlkKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIC8vcGluZ+WujOS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25QaW5nW3BlZXIubm9kZUlkXSA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHN1Y2Nlc3NcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44KS5ZCr44KB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBwZWVyLm5vZGVJZCB9O1xuICAgICAgLy9waW5n44KS6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgY29uc3Qgc3RvcmVGb3JtYXQ6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBwZWVyLnNlbmQoSlNPTi5zdHJpbmdpZnkoc3RvcmVGb3JtYXQpLCBcImthZFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGRvbmVcIiwgc3RvcmVGb3JtYXQpO1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGFzeW5jIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIik7XG4gICAgLy/mjqXntprnorroqo1cbiAgICBjb25zdCBwaW5nID0gdGhpcy5waW5nKHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICBpZiAoIXBpbmcpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIGNiID0gKHZhbHVlOiBhbnkpID0+IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFjay5vbkZpbmRWYWx1ZSA9IGNiO1xuICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgfSk7XG4gICAgLy8gY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICAvLyBpZiAoIXBlZXIpIHJldHVybjtcbiAgICAvLyB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3QgZmluZHZhbHVlOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIGZpbmR2YWx1ZSksIFwia2FkXCIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KGRhdGFsaW5rOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhbGluayk7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICBpZiAoIXRoaXMuc3RhdGUubWFpbnRhaW4pIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIHRoaXMuc3RhdGUubWFpbnRhaW4gPSB0cnVlO1xuICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcImJ1Y2tldCBmdWxsZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5waW5nKGtidWNrZXRbMF0pLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIHRoaXMuc3RhdGUubWFpbnRhaW4gPSBmYWxzZTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKDAsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIC8v5p2l44Gf44Or44O844OI44Gr6YCB44KK6L+U44GZXG4gICAgICAgIGNvbnN0IHN0b3JlRm9ybWF0OiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQoSlNPTi5zdHJpbmdpZnkoc3RvcmVGb3JtYXQpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhTGluayk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChkYXRhTGluayk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhcHBcIjpcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb25hcHBcIiwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vbkFwcChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJiaW5cIjpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGlmIChqc29uLnR5cGUgPT09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0ucHVzaChtZXNzYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19