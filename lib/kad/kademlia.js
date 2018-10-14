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
  function Kademlia(_nodeId) {
    _classCallCheck(this, Kademlia);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "k", void 0);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "f", void 0);

    _defineProperty(this, "responder", void 0);

    _defineProperty(this, "dataList", []);

    _defineProperty(this, "keyValueList", {});

    _defineProperty(this, "ref", {});

    _defineProperty(this, "state", {
      isOffer: false,
      findNode: "",
      hash: {}
    });

    _defineProperty(this, "onPing", {});

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onCommand: function onCommand(v) {},
      onFindValue: function onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onStore: function onStore(v) {},
      _onPing: this.onPing
    });

    console.log("start kad", _nodeId);
    this.k = 20;
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
                console.log("dofindvalue");
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
    value: function onCommand(datachannel) {
      var dataLink = datachannel.data;
      var networkLayer = JSON.parse(dataLink);

      if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
        this.dataList.push(networkLayer.hash);
        this.f.cleanDiscon();
        this.onRequest(dataLink);
        this.callback.onCommand(networkLayer);
      }
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uQ29tbWFuZCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJfb25QaW5nIiwib25QaW5nIiwiY29uc29sZSIsImxvZyIsImsiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInBlZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiaXNEaXNjb25uZWN0ZWQiLCJjbGVhbkRpc2NvbiIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0Iiwic2VuZERhdGEiLCJ0YXJnZXQiLCJzZW5kIiwiZGVmIiwiUElORyIsInNlbmRlciIsImtleSIsInZhbHVlIiwiU1RPUkUiLCJnZXRDbG9zZUVzdFBlZXIiLCJzdG9yZUZvcm1hdCIsInRhcmdldElkIiwicGluZyIsImNhdGNoIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJkYXRhIiwicmF3IiwiZGlzY29ubmVjdCIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImdldEFsbFBlZXJJZHMiLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJkYXRhbGluayIsIm5ldHdvcmsiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiIsImlueCIsImZvckVhY2giLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwiZGF0YWNoYW5uZWwiLCJkYXRhTGluayIsIm5ldHdvcmtMYXllciIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQU9xQkMsUTs7O0FBMkJuQixvQkFBWUMsT0FBWixFQUE2QjtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQXJCTixFQXFCTTs7QUFBQSwwQ0FwQlUsRUFvQlY7O0FBQUEsaUNBbkJJLEVBbUJKOztBQUFBLG1DQWxCckI7QUFDTkMsTUFBQUEsT0FBTyxFQUFFLEtBREg7QUFFTkMsTUFBQUEsUUFBUSxFQUFFLEVBRko7QUFHTkMsTUFBQUEsSUFBSSxFQUFFO0FBSEEsS0FrQnFCOztBQUFBLG9DQVptQixFQVluQjs7QUFBQSxzQ0FWbEI7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsU0FBUyxFQUFFLG1CQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhqQjtBQUlURyxNQUFBQSxXQUFXLEVBQUUscUJBQUNILENBQUQsRUFBYSxDQUFFLENBSm5CO0FBS1RJLE1BQUFBLFVBQVUsRUFBRSxvQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMbEI7QUFNVEssTUFBQUEsT0FBTyxFQUFFLGlCQUFDTCxDQUFELEVBQWEsQ0FBRSxDQU5mO0FBT1RNLE1BQUFBLE9BQU8sRUFBRSxLQUFLQztBQVBMLEtBVWtCOztBQUMzQkMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksV0FBWixFQUF5QmQsT0FBekI7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Q25DLElBQTdCO0FBQ0EsVUFBTXFDLFlBQVksR0FBRzFCLElBQUksQ0FBQ0MsS0FBTCxDQUFXd0IsUUFBWCxDQUFyQjs7QUFFQSxVQUFJLENBQUN6QixJQUFJLENBQUMyQixTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDSCxZQUFZLENBQUN6RixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELGFBQUsyRixRQUFMLENBQWNsQyxJQUFkLENBQW1CZ0MsWUFBWSxDQUFDekYsSUFBaEM7QUFDQSxhQUFLa0IsQ0FBTCxDQUFPVyxXQUFQO0FBQ0EsYUFBS2dFLFNBQUwsQ0FBZUwsUUFBZjtBQUNBLGFBQUsxRCxRQUFMLENBQWMxQixTQUFkLENBQXdCcUYsWUFBeEI7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBwcml2YXRlIG9uUGluZzogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgb25Db21tYW5kOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25TdG9yZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vblBpbmc6IHRoaXMub25QaW5nXG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHBpbmcocGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGluZ1wiLCBwZWVyLm5vZGVJZCk7XG5cbiAgICAgIC8vMTDnp5Lku6XlhoXjgatwaW5n44Gu44OV44Op44Kw44GM56uL44Gm44Gw5oiQ5YqfXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uUGVlckRpc2Nvbm5lY3QodGhpcy5rYnVja2V0cyk7XG4gICAgICAgIHJlamVjdChcInBpbmcgdGltZW91dCBcIiArIHBlZXIubm9kZUlkKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIC8vcGluZ+WujOS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25QaW5nW3BlZXIubm9kZUlkXSA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHN1Y2Nlc3NcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44KS5ZCr44KB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBwZWVyLm5vZGVJZCB9O1xuICAgICAgLy9waW5n44KS6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBzdG9yZUZvcm1hdChzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlXG4gICAgfTtcbiAgICByZXR1cm4gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSwgXCJrYWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSk7XG4gIH1cblxuICBhc3luYyBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIpO1xuICAgIC8v5o6l57aa56K66KqNXG4gICAgY29uc3QgcGluZyA9IHRoaXMucGluZyhwZWVyKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgaWYgKCFwaW5nKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBjYiA9ICh2YWx1ZTogYW55KSA9PiB7fSkge1xuICAgIHRoaXMuY2FsbGJhY2sub25GaW5kVmFsdWUgPSBjYjtcbiAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgIC8vIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAvLyBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgIC8vICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgIC8vIH0pO1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIik7XG4gICAgcGVlci5zZW5kKFxuICAgICAgbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwge1xuICAgICAgICB0YXJnZXRLZXk6IGtleVxuICAgICAgfSksXG4gICAgICBcImthZFwiXG4gICAgKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZGF0YSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIG9uUmVxdWVzdChkYXRhbGluazogc3RyaW5nKSB7XG4gICAgY29uc3QgbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YWxpbmspO1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxuXG4gIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJidWNrZXQgZnVsbGVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucGluZyhrYnVja2V0WzBdKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICBrYnVja2V0LnNwbGljZSgwLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGlmIChfKSBfLnNlbmQodGhpcy5zdG9yZUZvcm1hdCh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCB9KSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgb25Db21tYW5kKGRhdGFjaGFubmVsOiBhbnkpIHtcbiAgICBjb25zdCBkYXRhTGluayA9IGRhdGFjaGFubmVsLmRhdGE7XG4gICAgY29uc3QgbmV0d29ya0xheWVyID0gSlNPTi5wYXJzZShkYXRhTGluayk7XG5cbiAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5vblJlcXVlc3QoZGF0YUxpbmspO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkNvbW1hbmQobmV0d29ya0xheWVyKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==