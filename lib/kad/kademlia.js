"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NodeRTC = _interopRequireDefault(require("simple-datachannel/lib/NodeRTC"));

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
      onPing: this.onPing
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

        _this.callback.onPing[peer.nodeId] = function () {
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
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, {
                  targetKey: key
                }), "kad");

              case 1:
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
        var peer = r[target] = new _NodeRTC.default();
        peer.makeOffer();
        peer.connecting(target);
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 10 * 1000);
        peer.ev.on("signal", function (sdp) {
          console.log("kad offer store", target);

          var _ = _this3.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this3.store(_this3.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        });
        peer.ev.on("connect", function () {
          console.log("kad offer connected", target);

          _this3.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        });
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _NodeRTC.default();
        peer.makeAnswer(sdp);
        peer.connecting(target);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 10 * 1000);
        peer.ev.on("signal", function (sdp) {
          var _ = _this4.f.getPeerFromnodeId(proxy);

          if (_) _.send(_this4.storeFormat(_this4.nodeId, target, {
            sdp: sdp
          }), "kad");
        });
        peer.ev.on("connect", function () {
          console.log("kad answer connected", target);

          _this4.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uQ29tbWFuZCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uUGluZyIsImNvbnNvbGUiLCJsb2ciLCJrIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJwZWVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsImlzRGlzY29ubmVjdGVkIiwiY2xlYW5EaXNjb24iLCJjYWxsYmFjayIsImNsZWFyVGltZW91dCIsInNlbmREYXRhIiwidGFyZ2V0Iiwic2VuZCIsImRlZiIsIlBJTkciLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsIlNUT1JFIiwiZ2V0Q2xvc2VFc3RQZWVyIiwic3RvcmVGb3JtYXQiLCJ0YXJnZXRJZCIsInBpbmciLCJjYXRjaCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYiIsImRvRmluZHZhbHVlIiwiRklORFZBTFVFIiwiZGF0YSIsInJhdyIsImRpc2Nvbm5lY3QiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJnZXRBbGxQZWVySWRzIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiZGF0YWxpbmsiLCJuZXR3b3JrIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iLCJpbngiLCJmb3JFYWNoIiwic3BsaWNlIiwibGVuZ3RoIiwicmVzdWx0IiwicHJveHkiLCJyIiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwiY29ubmVjdGluZyIsImV2Iiwib24iLCJzZHAiLCJfIiwic3RvcmUiLCJhZGRrbm9kZSIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJkYXRhY2hhbm5lbCIsImRhdGFMaW5rIiwibmV0d29ya0xheWVyIiwic3RyaW5naWZ5IiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFMQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0lBT3FCQyxROzs7QUEwQm5CLG9CQUFZQyxPQUFaLEVBQTZCO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBcEJOLEVBb0JNOztBQUFBLDBDQW5CVSxFQW1CVjs7QUFBQSxpQ0FsQkksRUFrQko7O0FBQUEsbUNBakJyQjtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWlCcUI7O0FBQUEsb0NBWG1CLEVBV25COztBQUFBLHNDQVRsQjtBQUNUQyxNQUFBQSxTQUFTLEVBQUUsbUJBQUNDLENBQUQsRUFBYSxDQUFFLENBRGpCO0FBRVRDLE1BQUFBLGdCQUFnQixFQUFFLDBCQUFDRCxDQUFELEVBQWEsQ0FBRSxDQUZ4QjtBQUdURSxNQUFBQSxTQUFTLEVBQUUsbUJBQUNGLENBQUQsRUFBYSxDQUFFLENBSGpCO0FBSVRHLE1BQUFBLFdBQVcsRUFBRSxxQkFBQ0gsQ0FBRCxFQUFhLENBQUUsQ0FKbkI7QUFLVEksTUFBQUEsVUFBVSxFQUFFLG9CQUFDSixDQUFELEVBQWEsQ0FBRSxDQUxsQjtBQU1USyxNQUFBQSxNQUFNLEVBQUUsS0FBS0E7QUFOSixLQVNrQjs7QUFDM0JDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFdBQVosRUFBeUJaLE9BQXpCO0FBQ0EsU0FBS2EsQ0FBTCxHQUFTLEVBQVQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNkLE9BQWQ7QUFFQSxTQUFLZSxRQUFMLEdBQWdCLElBQUlDLEtBQUosQ0FBVSxHQUFWLENBQWhCOztBQUNBLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxHQUFwQixFQUF5QkEsQ0FBQyxFQUExQixFQUE4QjtBQUM1QixVQUFJQyxPQUFtQixHQUFHLEVBQTFCO0FBQ0EsV0FBS0gsUUFBTCxDQUFjRSxDQUFkLElBQW1CQyxPQUFuQjtBQUNEOztBQUVELFNBQUtDLENBQUwsR0FBUyxJQUFJQyxjQUFKLENBQVcsS0FBS1AsQ0FBaEIsRUFBbUIsS0FBS0UsUUFBeEIsQ0FBVDtBQUNBLFNBQUtNLFNBQUwsR0FBaUIsSUFBSUMsbUJBQUosQ0FBZSxJQUFmLENBQWpCO0FBQ0Q7Ozs7eUJBRUlDLEksRUFBYztBQUFBOztBQUNqQixhQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdENmLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLE1BQVosRUFBb0JXLElBQUksQ0FBQ1QsTUFBekIsRUFEc0MsQ0FHdEM7O0FBQ0EsWUFBTWEsT0FBTyxHQUFHQyxVQUFVLENBQUMsWUFBTTtBQUMvQmpCLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFdBQVosRUFBeUJXLElBQUksQ0FBQ1QsTUFBOUI7QUFDQVMsVUFBQUEsSUFBSSxDQUFDTSxjQUFMLEdBQXNCLElBQXRCOztBQUNBLFVBQUEsS0FBSSxDQUFDVixDQUFMLENBQU9XLFdBQVA7O0FBQ0EsVUFBQSxLQUFJLENBQUNDLFFBQUwsQ0FBY3pCLGdCQUFkLENBQStCLEtBQUksQ0FBQ1MsUUFBcEM7O0FBQ0FXLFVBQUFBLE1BQU0sQ0FBQyxrQkFBa0JILElBQUksQ0FBQ1QsTUFBeEIsQ0FBTjtBQUNELFNBTnlCLEVBTXZCLEtBQUssSUFOa0IsQ0FBMUIsQ0FKc0MsQ0FZdEM7O0FBQ0EsUUFBQSxLQUFJLENBQUNpQixRQUFMLENBQWNyQixNQUFkLENBQXFCYSxJQUFJLENBQUNULE1BQTFCLElBQW9DLFlBQU07QUFDeENILFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGNBQVosRUFBNEJXLElBQUksQ0FBQ1QsTUFBakM7QUFDQWtCLFVBQUFBLFlBQVksQ0FBQ0wsT0FBRCxDQUFaO0FBQ0FGLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQUpELENBYnNDLENBbUJ0Qzs7O0FBQ0EsWUFBTVEsUUFBUSxHQUFHO0FBQUVDLFVBQUFBLE1BQU0sRUFBRVgsSUFBSSxDQUFDVDtBQUFmLFNBQWpCLENBcEJzQyxDQXFCdEM7O0FBQ0FTLFFBQUFBLElBQUksQ0FBQ1ksSUFBTCxDQUFVLDJCQUFjLEtBQUksQ0FBQ3JCLE1BQW5CLEVBQTJCc0IsZ0JBQUlDLElBQS9CLEVBQXFDSixRQUFyQyxDQUFWLEVBQTBELEtBQTFEO0FBQ0QsT0F2Qk0sQ0FBUDtBQXdCRDs7O2dDQUVXSyxNLEVBQWdCQyxHLEVBQWFDLEssRUFBWTtBQUNuRCxVQUFNUCxRQUFRLEdBQUc7QUFDZkssUUFBQUEsTUFBTSxFQUFOQSxNQURlO0FBRWZDLFFBQUFBLEdBQUcsRUFBSEEsR0FGZTtBQUdmQyxRQUFBQSxLQUFLLEVBQUxBO0FBSGUsT0FBakI7QUFLQSxhQUFPLDJCQUFjLEtBQUsxQixNQUFuQixFQUEyQnNCLGdCQUFJSyxLQUEvQixFQUFzQ1IsUUFBdEMsQ0FBUDtBQUNEOzs7Ozs7K0NBRVdLLE0sRUFBZ0JDLEcsRUFBYUMsSzs7Ozs7O0FBQ3ZDO0FBQ01qQixnQkFBQUEsSSxHQUFPLEtBQUtKLENBQUwsQ0FBT3VCLGVBQVAsQ0FBdUJILEdBQXZCLEM7O29CQUNSaEIsSTs7Ozs7Ozs7QUFDTFosZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZd0IsZ0JBQUlLLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCbEIsSUFBSSxDQUFDVCxNQUFwQyxFQUE0QyxRQUE1QyxFQUFzRHlCLEdBQXREO0FBQ0FoQixnQkFBQUEsSUFBSSxDQUFDWSxJQUFMLENBQVUsS0FBS1EsV0FBTCxDQUFpQkwsTUFBakIsRUFBeUJDLEdBQXpCLEVBQThCQyxLQUE5QixDQUFWLEVBQWdELEtBQWhEO0FBQ0E3QixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksWUFBWixFQUEwQixLQUFLK0IsV0FBTCxDQUFpQkwsTUFBakIsRUFBeUJDLEdBQXpCLEVBQThCQyxLQUE5QixDQUExQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnREFHYUksUSxFQUFrQnJCLEk7Ozs7OztBQUMvQlosZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFVBQVosRSxDQUNBOztBQUNNaUMsZ0JBQUFBLEksR0FBTyxLQUFLQSxJQUFMLENBQVV0QixJQUFWLEVBQWdCdUIsS0FBaEIsQ0FBc0JuQyxPQUFPLENBQUNDLEdBQTlCLEM7O29CQUNSaUMsSTs7Ozs7Ozs7QUFDTGxDLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCZ0MsUUFBeEI7QUFDQSxxQkFBS0csS0FBTCxDQUFXN0MsUUFBWCxHQUFzQjBDLFFBQXRCO0FBQ01YLGdCQUFBQSxRLEdBQVc7QUFBRWUsa0JBQUFBLFNBQVMsRUFBRUo7QUFBYixpQixFQUNqQjs7QUFDQXJCLGdCQUFBQSxJQUFJLENBQUNZLElBQUwsQ0FBVSwyQkFBYyxLQUFLckIsTUFBbkIsRUFBMkJzQixnQkFBSWEsUUFBL0IsRUFBeUNoQixRQUF6QyxDQUFWLEVBQThELEtBQTlEOzs7Ozs7Ozs7Ozs7Ozs7OzhCQUdRTSxHLEVBQXNDO0FBQUEsVUFBekJXLEVBQXlCLHVFQUFwQixVQUFDVixLQUFELEVBQWdCLENBQUUsQ0FBRTtBQUM5QyxXQUFLVCxRQUFMLENBQWN2QixXQUFkLEdBQTRCMEMsRUFBNUIsQ0FEOEMsQ0FFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxVQUFNM0IsSUFBSSxHQUFHLEtBQUtKLENBQUwsQ0FBT3VCLGVBQVAsQ0FBdUJILEdBQXZCLENBQWI7QUFDQSxVQUFJLENBQUNoQixJQUFMLEVBQVc7QUFDWCxXQUFLNEIsV0FBTCxDQUFpQlosR0FBakIsRUFBc0JoQixJQUF0QjtBQUNEOzs7Ozs7Z0RBRWlCZ0IsRyxFQUFhaEIsSTs7Ozs7QUFDN0JBLGdCQUFBQSxJQUFJLENBQUNZLElBQUwsQ0FDRSwyQkFBYyxLQUFLckIsTUFBbkIsRUFBMkJzQixnQkFBSWdCLFNBQS9CLEVBQTBDO0FBQ3hDSixrQkFBQUEsU0FBUyxFQUFFVDtBQUQ2QixpQkFBMUMsQ0FERixFQUlFLEtBSkY7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBUU9oQixJLEVBQWM7QUFBQTs7QUFDckJBLE1BQUFBLElBQUksQ0FBQzhCLElBQUwsR0FBWSxVQUFBQyxHQUFHLEVBQUk7QUFDakIsUUFBQSxNQUFJLENBQUMvQyxTQUFMLENBQWUrQyxHQUFmO0FBQ0QsT0FGRDs7QUFJQS9CLE1BQUFBLElBQUksQ0FBQ2dDLFVBQUwsR0FBa0IsWUFBTTtBQUN0QjVDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHVCQUFaOztBQUNBLFFBQUEsTUFBSSxDQUFDTyxDQUFMLENBQU9XLFdBQVA7QUFDRCxPQUhEOztBQUtBLFVBQUksQ0FBQyxLQUFLWCxDQUFMLENBQU9xQyxXQUFQLENBQW1CakMsSUFBSSxDQUFDVCxNQUF4QixDQUFMLEVBQXNDO0FBQ3BDO0FBQ0EsWUFBTTJDLEdBQUcsR0FBRywyQkFBUyxLQUFLM0MsTUFBZCxFQUFzQlMsSUFBSSxDQUFDVCxNQUEzQixDQUFaLENBRm9DLENBR3BDOztBQUNBLFlBQU1JLE9BQU8sR0FBRyxLQUFLSCxRQUFMLENBQWMwQyxHQUFkLENBQWhCLENBSm9DLENBS3BDOztBQUNBdkMsUUFBQUEsT0FBTyxDQUFDd0MsSUFBUixDQUFhbkMsSUFBYjtBQUVBWixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxjQUFqQyxFQUFpRFcsSUFBSSxDQUFDVCxNQUF0RDtBQUNBSCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxLQUFLTyxDQUFMLENBQU93QyxhQUFQLEVBQVo7QUFFQS9CLFFBQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBQSxNQUFJLENBQUNnQyxXQUFMLENBQWlCckMsSUFBakI7QUFDRCxTQUZTLEVBRVAsSUFGTyxDQUFWO0FBSUEsYUFBS1EsUUFBTCxDQUFjM0IsU0FBZCxDQUF3QixLQUFLZSxDQUFMLENBQU93QyxhQUFQLEVBQXhCO0FBQ0Q7QUFDRjs7O2dDQUVXcEMsSSxFQUFjO0FBQ3hCLFVBQUksS0FBS0osQ0FBTCxDQUFPMEMsYUFBUCxLQUF5QixLQUFLaEQsQ0FBbEMsRUFBcUM7QUFDbkM7QUFDQSxhQUFLWCxRQUFMLENBQWMsS0FBS1ksTUFBbkIsRUFBMkJTLElBQTNCO0FBQ0QsT0FIRCxNQUdPO0FBQ0xaLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsS0FBS08sQ0FBTCxDQUFPMEMsYUFBUCxFQUE3QjtBQUNEO0FBQ0Y7Ozs4QkFFU0MsUSxFQUFrQjtBQUMxQixVQUFNQyxPQUFPLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXSCxRQUFYLENBQWhCO0FBQ0EsV0FBS3pDLFNBQUwsQ0FBZTZDLFFBQWYsQ0FBd0JILE9BQU8sQ0FBQ0ksSUFBaEMsRUFBc0NKLE9BQXRDO0FBQ0EsV0FBS0ssUUFBTCxDQUFjTCxPQUFkO0FBQ0Q7Ozs7OztnREFFY0EsTzs7Ozs7O0FBQ1BNLGdCQUFBQSxHLEdBQU0sMkJBQVMsS0FBS3ZELE1BQWQsRUFBc0JpRCxPQUFPLENBQUNqRCxNQUE5QixDO0FBQ05JLGdCQUFBQSxPLEdBQVUsS0FBS0gsUUFBTCxDQUFjc0QsR0FBZCxDLEVBRWhCO0FBQ0E7O0FBQ0FuRCxnQkFBQUEsT0FBTyxDQUFDb0QsT0FBUixDQUFnQixVQUFDL0MsSUFBRCxFQUFPTixDQUFQLEVBQWE7QUFDM0Isc0JBQUlNLElBQUksQ0FBQ1QsTUFBTCxLQUFnQmlELE9BQU8sQ0FBQ2pELE1BQTVCLEVBQW9DO0FBQ2xDSCxvQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixrQ0FBeEI7QUFDQU0sb0JBQUFBLE9BQU8sQ0FBQ3FELE1BQVIsQ0FBZXRELENBQWYsRUFBa0IsQ0FBbEI7QUFDQUMsb0JBQUFBLE9BQU8sQ0FBQ3dDLElBQVIsQ0FBYW5DLElBQWI7QUFDQSwyQkFBTyxDQUFQO0FBQ0Q7QUFDRixpQkFQRCxFLENBU0E7QUFDQTs7c0JBQ0lMLE9BQU8sQ0FBQ3NELE1BQVIsR0FBaUIsS0FBSzNELEM7Ozs7O0FBQ3hCRixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixlQUF4QixFQUF5Q21ELE9BQU8sQ0FBQ2pELE1BQWpEOzt1QkFDcUIsS0FBSytCLElBQUwsQ0FBVTNCLE9BQU8sQ0FBQyxDQUFELENBQWpCLEVBQXNCNEIsS0FBdEIsQ0FBNEJuQyxPQUFPLENBQUNDLEdBQXBDLEM7OztBQUFmNkQsZ0JBQUFBLE07O0FBQ04sb0JBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1h2RCxrQkFBQUEsT0FBTyxDQUFDcUQsTUFBUixDQUFlLENBQWYsRUFBa0IsQ0FBbEI7QUFDRDs7Ozs7Ozs7Ozs7Ozs7OzswQkFJQ3JDLE0sRUFBOEI7QUFBQTs7QUFBQSxVQUFkd0MsS0FBYyx1RUFBTixJQUFNO0FBQ2xDLGFBQU8sSUFBSWxELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBTWlELENBQUMsR0FBRyxNQUFJLENBQUNDLEdBQWY7QUFDQSxZQUFNckQsSUFBSSxHQUFJb0QsQ0FBQyxDQUFDekMsTUFBRCxDQUFELEdBQVksSUFBSTJDLGdCQUFKLEVBQTFCO0FBQ0F0RCxRQUFBQSxJQUFJLENBQUN1RCxTQUFMO0FBQ0F2RCxRQUFBQSxJQUFJLENBQUN3RCxVQUFMLENBQWdCN0MsTUFBaEI7QUFFQSxZQUFNUCxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CRixVQUFBQSxNQUFNLENBQUMsbUJBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLEtBQUssSUFGa0IsQ0FBMUI7QUFJQUgsUUFBQUEsSUFBSSxDQUFDeUQsRUFBTCxDQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixVQUFDQyxHQUFELEVBQWlCO0FBQ3BDdkUsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0JzQixNQUEvQjs7QUFDQSxjQUFNaUQsQ0FBQyxHQUFHLE1BQUksQ0FBQ2hFLENBQUwsQ0FBT3VCLGVBQVAsQ0FBdUJSLE1BQXZCLENBQVY7O0FBQ0EsY0FBSSxDQUFDaUQsQ0FBTCxFQUFRO0FBQ1IsY0FBSUEsQ0FBQyxDQUFDckUsTUFBRixLQUFhb0IsTUFBakIsRUFDRSxNQUFJLENBQUNrRCxLQUFMLENBQVcsTUFBSSxDQUFDdEUsTUFBaEIsRUFBd0JvQixNQUF4QixFQUFnQztBQUFFZ0QsWUFBQUEsR0FBRyxFQUFIQSxHQUFGO0FBQU9SLFlBQUFBLEtBQUssRUFBTEE7QUFBUCxXQUFoQztBQUNILFNBTkQ7QUFRQW5ELFFBQUFBLElBQUksQ0FBQ3lELEVBQUwsQ0FBUUMsRUFBUixDQUFXLFNBQVgsRUFBc0IsWUFBTTtBQUMxQnRFLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBQW1Dc0IsTUFBbkM7O0FBQ0EsVUFBQSxNQUFJLENBQUNtRCxRQUFMLENBQWM5RCxJQUFkOztBQUNBUyxVQUFBQSxZQUFZLENBQUNMLE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FMRDtBQU1ELE9BeEJNLENBQVA7QUF5QkQ7OzsyQkFFTVMsTSxFQUFnQmdELEcsRUFBYVIsSyxFQUFlO0FBQUE7O0FBQ2pELGFBQU8sSUFBSWxELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBTWlELENBQUMsR0FBRyxNQUFJLENBQUNDLEdBQWY7QUFDQSxZQUFNckQsSUFBSSxHQUFJb0QsQ0FBQyxDQUFDekMsTUFBRCxDQUFELEdBQVksSUFBSTJDLGdCQUFKLEVBQTFCO0FBQ0F0RCxRQUFBQSxJQUFJLENBQUMrRCxVQUFMLENBQWdCSixHQUFoQjtBQUNBM0QsUUFBQUEsSUFBSSxDQUFDd0QsVUFBTCxDQUFnQjdDLE1BQWhCO0FBQ0F2QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaLEVBQTBCc0IsTUFBMUI7QUFFQSxZQUFNUCxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CRixVQUFBQSxNQUFNLENBQUMsb0JBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLEtBQUssSUFGa0IsQ0FBMUI7QUFJQUgsUUFBQUEsSUFBSSxDQUFDeUQsRUFBTCxDQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixVQUFDQyxHQUFELEVBQWlCO0FBQ3BDLGNBQU1DLENBQUMsR0FBRyxNQUFJLENBQUNoRSxDQUFMLENBQU9vRSxpQkFBUCxDQUF5QmIsS0FBekIsQ0FBVjs7QUFDQSxjQUFJUyxDQUFKLEVBQU9BLENBQUMsQ0FBQ2hELElBQUYsQ0FBTyxNQUFJLENBQUNRLFdBQUwsQ0FBaUIsTUFBSSxDQUFDN0IsTUFBdEIsRUFBOEJvQixNQUE5QixFQUFzQztBQUFFZ0QsWUFBQUEsR0FBRyxFQUFIQTtBQUFGLFdBQXRDLENBQVAsRUFBdUQsS0FBdkQ7QUFDUixTQUhEO0FBS0EzRCxRQUFBQSxJQUFJLENBQUN5RCxFQUFMLENBQVFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFlBQU07QUFDMUJ0RSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ3NCLE1BQXBDOztBQUNBLFVBQUEsTUFBSSxDQUFDbUQsUUFBTCxDQUFjOUQsSUFBZDs7QUFDQVMsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBTEQ7QUFNRCxPQXRCTSxDQUFQO0FBdUJEOzs7eUJBRUlTLE0sRUFBZ0JtQixJLEVBQVc7QUFDOUIsVUFBTThCLENBQUMsR0FBRyxLQUFLaEUsQ0FBTCxDQUFPb0UsaUJBQVAsQ0FBeUJyRCxNQUF6QixDQUFWOztBQUNBLFVBQUlpRCxDQUFKLEVBQU9BLENBQUMsQ0FBQ2hELElBQUYsQ0FBTywyQkFBYyxLQUFLckIsTUFBbkIsRUFBMkJzQixnQkFBSW9ELElBQS9CLEVBQXFDbkMsSUFBckMsQ0FBUCxFQUFtRCxLQUFuRDtBQUNSOzs7OEJBRVNvQyxXLEVBQWtCO0FBQzFCLFVBQU1DLFFBQVEsR0FBR0QsV0FBVyxDQUFDcEMsSUFBN0I7QUFDQSxVQUFNc0MsWUFBWSxHQUFHM0IsSUFBSSxDQUFDQyxLQUFMLENBQVd5QixRQUFYLENBQXJCOztBQUVBLFVBQUksQ0FBQzFCLElBQUksQ0FBQzRCLFNBQUwsQ0FBZSxLQUFLQyxRQUFwQixFQUE4QkMsUUFBOUIsQ0FBdUNILFlBQVksQ0FBQ3hGLElBQXBELENBQUwsRUFBZ0U7QUFDOUQsYUFBSzBGLFFBQUwsQ0FBY25DLElBQWQsQ0FBbUJpQyxZQUFZLENBQUN4RixJQUFoQztBQUNBLGFBQUtnQixDQUFMLENBQU9XLFdBQVA7QUFDQSxhQUFLaUUsU0FBTCxDQUFlTCxRQUFmO0FBQ0EsYUFBSzNELFFBQUwsQ0FBY3hCLFNBQWQsQ0FBd0JvRixZQUF4QjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJzaW1wbGUtZGF0YWNoYW5uZWwvbGliL05vZGVSVENcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25QaW5nOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkNvbW1hbmQ6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBpbmc6IHRoaXMub25QaW5nXG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHBpbmcocGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGluZ1wiLCBwZWVyLm5vZGVJZCk7XG5cbiAgICAgIC8vMTDnp5Lku6XlhoXjgatwaW5n44Gu44OV44Op44Kw44GM56uL44Gm44Gw5oiQ5YqfXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uUGVlckRpc2Nvbm5lY3QodGhpcy5rYnVja2V0cyk7XG4gICAgICAgIHJlamVjdChcInBpbmcgdGltZW91dCBcIiArIHBlZXIubm9kZUlkKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIC8vcGluZ+WujOS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgdGhpcy5jYWxsYmFjay5vblBpbmdbcGVlci5ub2RlSWRdID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgc3VjY2Vzc1wiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgpLlkKvjgoHjgotcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXQ6IHBlZXIubm9kZUlkIH07XG4gICAgICAvL3BpbmfjgpLpgIHjgotcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuUElORywgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0b3JlRm9ybWF0KHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGNvbnN0IHNlbmREYXRhID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWVcbiAgICB9O1xuICAgIHJldHVybiBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQodGhpcy5zdG9yZUZvcm1hdChzZW5kZXIsIGtleSwgdmFsdWUpLCBcImthZFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGRvbmVcIiwgdGhpcy5zdG9yZUZvcm1hdChzZW5kZXIsIGtleSwgdmFsdWUpKTtcbiAgfVxuXG4gIGFzeW5jIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIik7XG4gICAgLy/mjqXntprnorroqo1cbiAgICBjb25zdCBwaW5nID0gdGhpcy5waW5nKHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICBpZiAoIXBpbmcpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIGNiID0gKHZhbHVlOiBhbnkpID0+IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFjay5vbkZpbmRWYWx1ZSA9IGNiO1xuICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIC8vIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgLy8gICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgLy8gfSk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5zZW5kKFxuICAgICAgbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwge1xuICAgICAgICB0YXJnZXRLZXk6IGtleVxuICAgICAgfSksXG4gICAgICBcImthZFwiXG4gICAgKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZGF0YSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIG9uUmVxdWVzdChkYXRhbGluazogc3RyaW5nKSB7XG4gICAgY29uc3QgbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YWxpbmspO1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxuXG4gIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJidWNrZXQgZnVsbGVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucGluZyhrYnVja2V0WzBdKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICBrYnVja2V0LnNwbGljZSgwLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG4gICAgICBwZWVyLmNvbm5lY3RpbmcodGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJzaWduYWxcIiwgKHNkcDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBwZWVyLmV2Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBwZWVyLmNvbm5lY3RpbmcodGFyZ2V0KTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJzaWduYWxcIiwgKHNkcDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBpZiAoXykgXy5zZW5kKHRoaXMuc3RvcmVGb3JtYXQodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAgfSksIFwia2FkXCIpO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBvbkNvbW1hbmQoZGF0YWNoYW5uZWw6IGFueSkge1xuICAgIGNvbnN0IGRhdGFMaW5rID0gZGF0YWNoYW5uZWwuZGF0YTtcbiAgICBjb25zdCBuZXR3b3JrTGF5ZXIgPSBKU09OLnBhcnNlKGRhdGFMaW5rKTtcblxuICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLm9uUmVxdWVzdChkYXRhTGluayk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQ29tbWFuZChuZXR3b3JrTGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuIl19