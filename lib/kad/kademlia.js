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
      hash: {}
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
    key: "storeFormat",
    value: function storeFormat(sender, key, value) {
      var sendData = {
        sender: sender,
        key: key,
        value: value
      };
      return (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
    }
  }, {
    key: "store",
    value: function () {
      var _store = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sender, key, value) {
        var peer;
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
                peer.send(this.storeFormat(sender, key, value), "kad");
                console.log("store done", this.storeFormat(sender, key, value));

              case 6:
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
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得
      // const peers = this.f.getClosePeers(key);
      // peers.forEach(peer => {
      //   this.doFindvalue(key, peer);
      // });

      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      this.doFindvalue(key, peer);
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, peer) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, {
                  targetKey: key
                }), "kad");

              case 2:
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
      var _this2 = this;

      peer.data = function (raw) {
        _this2.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this2.f.cleanDiscon();
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this2.findNewPeer(peer);
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
      this.maintain(network);
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
                  _context4.next = 9;
                  break;
                }

                console.log("maintain", "bucket fulled", network.nodeId);
                _context4.next = 7;
                return this.ping(kbucket[0]).catch(console.log);

              case 7:
                result = _context4.sent;

                if (!result) {
                  kbucket.splice(0, 1);
                }

              case 9:
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
      var _this3 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this3.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 10 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this3.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this3.store(_this3.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this3.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 10 * 1000);

        peer.signal = function (sdp) {
          var _ = _this4.f.getPeerFromnodeId(proxy);

          if (_) _.send(_this4.storeFormat(_this4.nodeId, target, {
            sdp: sdp
          }), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this4.addknode(peer);

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
          var networkLayer = JSON.parse(dataLink);

          if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
            this.dataList.push(networkLayer.hash);
            this.f.cleanDiscon();
            this.onRequest(dataLink);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJfb25QaW5nIiwib25QaW5nIiwib25BcHAiLCJjb25zb2xlIiwibG9nIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInBlZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiaXNEaXNjb25uZWN0ZWQiLCJjbGVhbkRpc2NvbiIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0Iiwic2VuZERhdGEiLCJ0YXJnZXQiLCJzZW5kIiwiZGVmIiwiUElORyIsInNlbmRlciIsImtleSIsInZhbHVlIiwiU1RPUkUiLCJnZXRDbG9zZUVzdFBlZXIiLCJzdG9yZUZvcm1hdCIsInRhcmdldElkIiwicGluZyIsImNhdGNoIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImdldEFsbFBlZXJJZHMiLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJkYXRhbGluayIsIm5ldHdvcmsiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiIsImlueCIsImZvckVhY2giLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwianNvbiIsImJ1ZmZlciIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLFE7OztBQTRCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBdEJsQyxFQXNCa0M7O0FBQUEsMENBckJsQixFQXFCa0I7O0FBQUEsaUNBcEJ4QixFQW9Cd0I7O0FBQUEsb0NBbkJqQixFQW1CaUI7O0FBQUEsbUNBbEJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWtCaUQ7O0FBQUEsb0NBWlQsRUFZUzs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9BQU8sRUFBRSxpQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMZjtBQU1USyxNQUFBQSxPQUFPLEVBQUUsS0FBS0MsTUFOTDtBQU9UQyxNQUFBQSxLQUFLLEVB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LEVBQTlCO0FBQ0QsYUFGRCxNQUVPLElBQUltRixJQUFJLENBQUM3QixJQUFMLEtBQWMsS0FBbEIsRUFBeUIsQ0FDL0I7QUFDRixXQU5ELENBTUUsT0FBTytCLEtBQVAsRUFBYztBQUNkLGdCQUFJLENBQUMsS0FBS0QsTUFBTCxDQUFZVCxPQUFPLENBQUMzRSxNQUFwQixDQUFMLEVBQWtDO0FBQ2hDLG1CQUFLb0YsTUFBTCxDQUFZVCxPQUFPLENBQUMzRSxNQUFwQixJQUE4QixFQUE5QjtBQUNEOztBQUNELGlCQUFLb0YsTUFBTCxDQUFZVCxPQUFPLENBQUMzRSxNQUFwQixFQUE0QjZDLElBQTVCLENBQWlDOEIsT0FBTyxDQUFDcEMsSUFBekM7QUFDRDs7QUFDRDtBQTNCSjtBQTZCRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBwcml2YXRlIG9uUGluZzogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25TdG9yZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vblBpbmc6IHRoaXMub25QaW5nLFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcsIG9wdD86IHsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCkgaWYgKG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgcGluZyhwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJwaW5nXCIsIHBlZXIubm9kZUlkKTtcblxuICAgICAgLy8xMOenkuS7peWGheOBq3Bpbmfjga7jg5Xjg6njgrDjgYznq4vjgabjgbDmiJDlip9cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIGZhaWxcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBwZWVyLmlzRGlzY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sub25QZWVyRGlzY29ubmVjdCh0aGlzLmtidWNrZXRzKTtcbiAgICAgICAgcmVqZWN0KFwicGluZyB0aW1lb3V0IFwiICsgcGVlci5ub2RlSWQpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgLy9waW5n5a6M5LqG5pmC44Gu44Kz44O844Or44OQ44OD44KvXG4gICAgICB0aGlzLmNhbGxiYWNrLl9vblBpbmdbcGVlci5ub2RlSWRdID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgc3VjY2Vzc1wiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgpLlkKvjgoHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IHBlZXIubm9kZUlkIH07XG4gICAgICAvL3BpbmfjgpLpgIHjgotcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuUElORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3JlRm9ybWF0KHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGNvbnN0IHNlbmREYXRhID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWVcbiAgICB9O1xuICAgIHJldHVybiBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQodGhpcy5zdG9yZUZvcm1hdChzZW5kZXIsIGtleSwgdmFsdWUpLCBcImthZFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGRvbmVcIiwgdGhpcy5zdG9yZUZvcm1hdChzZW5kZXIsIGtleSwgdmFsdWUpKTtcbiAgfVxuXG4gIGFzeW5jIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIik7XG4gICAgLy/mjqXntprnorroqo1cbiAgICBjb25zdCBwaW5nID0gdGhpcy5waW5nKHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICBpZiAoIXBpbmcpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIGNiID0gKHZhbHVlOiBhbnkpID0+IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFjay5vbkZpbmRWYWx1ZSA9IGNiO1xuICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIC8vIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgLy8gICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgLy8gfSk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgcGVlci5zZW5kKFxuICAgICAgbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwge1xuICAgICAgICB0YXJnZXRLZXk6IGtleVxuICAgICAgfSksXG4gICAgICBcImthZFwiXG4gICAgKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZGF0YSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIG9uUmVxdWVzdChkYXRhbGluazogc3RyaW5nKSB7XG4gICAgY29uc3QgbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YWxpbmspO1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxuXG4gIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJidWNrZXQgZnVsbGVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucGluZyhrYnVja2V0WzBdKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICBrYnVja2V0LnNwbGljZSgwLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGlmIChfKSBfLnNlbmQodGhpcy5zdG9yZUZvcm1hdCh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCB9KSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UubGFiZWwpIHtcbiAgICAgIGNhc2UgXCJrYWRcIjpcbiAgICAgICAgY29uc3QgZGF0YUxpbmsgPSBtZXNzYWdlLmRhdGE7XG4gICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YUxpbmspO1xuICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICAgICAgdGhpcy5vblJlcXVlc3QoZGF0YUxpbmspO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImFwcFwiOlxuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvbmFwcFwiLCBtZXNzYWdlLmRhdGEpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uQXBwKEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImJpblwiOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgaWYgKGpzb24udHlwZSA9PT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0gPSBbXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGpzb24udHlwZSA9PT0gXCJlbmRcIikge1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSkge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXS5wdXNoKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG4iXX0=