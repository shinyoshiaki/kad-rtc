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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uQ29tbWFuZCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIl9vblBpbmciLCJvblBpbmciLCJjb25zb2xlIiwibG9nIiwiayIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwicGVlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJpc0Rpc2Nvbm5lY3RlZCIsImNsZWFuRGlzY29uIiwiY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJzZW5kRGF0YSIsInRhcmdldCIsInNlbmQiLCJkZWYiLCJQSU5HIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJTVE9SRSIsImdldENsb3NlRXN0UGVlciIsInN0b3JlRm9ybWF0IiwidGFyZ2V0SWQiLCJwaW5nIiwiY2F0Y2giLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2IiLCJkb0ZpbmR2YWx1ZSIsIkZJTkRWQUxVRSIsImRhdGEiLCJyYXciLCJkaXNjb25uZWN0IiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZ2V0QWxsUGVlcklkcyIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImRhdGFsaW5rIiwibmV0d29yayIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIiwiaW54IiwiZm9yRWFjaCIsInNwbGljZSIsImxlbmd0aCIsInJlc3VsdCIsInByb3h5IiwiciIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsImNvbm5lY3RpbmciLCJldiIsIm9uIiwic2RwIiwiXyIsInN0b3JlIiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwiZGF0YWNoYW5uZWwiLCJkYXRhTGluayIsIm5ldHdvcmtMYXllciIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQU9xQkMsUTs7O0FBMEJuQixvQkFBWUMsT0FBWixFQUE2QjtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQXBCTixFQW9CTTs7QUFBQSwwQ0FuQlUsRUFtQlY7O0FBQUEsaUNBbEJJLEVBa0JKOztBQUFBLG1DQWpCckI7QUFDTkMsTUFBQUEsT0FBTyxFQUFFLEtBREg7QUFFTkMsTUFBQUEsUUFBUSxFQUFFLEVBRko7QUFHTkMsTUFBQUEsSUFBSSxFQUFFO0FBSEEsS0FpQnFCOztBQUFBLG9DQVhtQixFQVduQjs7QUFBQSxzQ0FUbEI7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsU0FBUyxFQUFFLG1CQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhqQjtBQUlURyxNQUFBQSxXQUFXLEVBQUUscUJBQUNILENBQUQsRUFBYSxDQUFFLENBSm5CO0FBS1RJLE1BQUFBLFVBQVUsRUFBRSxvQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMbEI7QUFNVEssTUFBQUEsT0FBTyxFQUFFLEtBQUtDO0FBTkwsS0FTa0I7O0FBQzNCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCYixPQUF6QjtBQUNBLFNBQUtjLENBQUwsR0FBUyxFQUFUO0FBQ0EsU0FBS0MsTUFBTCxHQUFjZixPQUFkO0FBRUEsU0FBS2dCLFFBQUwsR0FBZ0IsSUFBSUMsS0FBSixDQUFVLEdBQVYsQ0FBaEI7O0FBQ0EsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEdBQXBCLEVBQXlCQSxDQUFDLEVBQTFCLEVBQThCO0FBQzVCLFVBQUlDLE9BQW1CLEdBQUcsRUFBMUI7QUFDQSxXQUFLSCxRQUFMLENBQWNFLENBQWQsSUFBbUJDLE9BQW5CO0FBQ0Q7O0FBRUQsU0FBS0MsQ0FBTCxHQUFTLElBQUlDLGNBQUosQ0FBVyxLQUFLUCxDQUFoQixFQUFtQixLQUFLRSxRQUF4QixDQUFUO0FBQ0EsU0FBS00sU0FBTCxHQUFpQixJQUFJQyxtQkFBSixDQUFlLElBQWYsQ0FBakI7QUFDRDs7Ozt5QkFFSUMsSSxFQUFjO0FBQUE7O0FBQ2pCLGFBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q2YsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQlcsSUFBSSxDQUFDVCxNQUF6QixFQURzQyxDQUd0Qzs7QUFDQSxZQUFNYSxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CakIsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksV0FBWixFQUF5QlcsSUFBSSxDQUFDVCxNQUE5QjtBQUNBUyxVQUFBQSxJQUFJLENBQUNNLGNBQUwsR0FBc0IsSUFBdEI7O0FBQ0EsVUFBQSxLQUFJLENBQUNWLENBQUwsQ0FBT1csV0FBUDs7QUFDQSxVQUFBLEtBQUksQ0FBQ0MsUUFBTCxDQUFjMUIsZ0JBQWQsQ0FBK0IsS0FBSSxDQUFDVSxRQUFwQzs7QUFDQVcsVUFBQUEsTUFBTSxDQUFDLGtCQUFrQkgsSUFBSSxDQUFDVCxNQUF4QixDQUFOO0FBQ0QsU0FOeUIsRUFNdkIsS0FBSyxJQU5rQixDQUExQixDQUpzQyxDQVl0Qzs7QUFDQSxRQUFBLEtBQUksQ0FBQ2lCLFFBQUwsQ0FBY3RCLE9BQWQsQ0FBc0JjLElBQUksQ0FBQ1QsTUFBM0IsSUFBcUMsWUFBTTtBQUN6Q0gsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QlcsSUFBSSxDQUFDVCxNQUFqQztBQUNBa0IsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBSkQsQ0Fic0MsQ0FtQnRDOzs7QUFDQSxZQUFNUSxRQUFRLEdBQUc7QUFBRUMsVUFBQUEsTUFBTSxFQUFFWCxJQUFJLENBQUNUO0FBQWYsU0FBakIsQ0FwQnNDLENBcUJ0Qzs7QUFDQVMsUUFBQUEsSUFBSSxDQUFDWSxJQUFMLENBQVUsMkJBQWMsS0FBSSxDQUFDckIsTUFBbkIsRUFBMkJzQixnQkFBSUMsSUFBL0IsRUFBcUNKLFFBQXJDLENBQVYsRUFBMEQsS0FBMUQ7QUFDRCxPQXZCTSxDQUFQO0FBd0JEOzs7Z0NBRVdLLE0sRUFBZ0JDLEcsRUFBYUMsSyxFQUFZO0FBQ25ELFVBQU1QLFFBQVEsR0FBRztBQUNmSyxRQUFBQSxNQUFNLEVBQU5BLE1BRGU7QUFFZkMsUUFBQUEsR0FBRyxFQUFIQSxHQUZlO0FBR2ZDLFFBQUFBLEtBQUssRUFBTEE7QUFIZSxPQUFqQjtBQUtBLGFBQU8sMkJBQWMsS0FBSzFCLE1BQW5CLEVBQTJCc0IsZ0JBQUlLLEtBQS9CLEVBQXNDUixRQUF0QyxDQUFQO0FBQ0Q7Ozs7OzsrQ0FFV0ssTSxFQUFnQkMsRyxFQUFhQyxLOzs7Ozs7QUFDdkM7QUFDTWpCLGdCQUFBQSxJLEdBQU8sS0FBS0osQ0FBTCxDQUFPdUIsZUFBUCxDQUF1QkgsR0FBdkIsQzs7b0JBQ1JoQixJOzs7Ozs7OztBQUNMWixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVl3QixnQkFBSUssS0FBaEIsRUFBdUIsTUFBdkIsRUFBK0JsQixJQUFJLENBQUNULE1BQXBDLEVBQTRDLFFBQTVDLEVBQXNEeUIsR0FBdEQ7QUFDQWhCLGdCQUFBQSxJQUFJLENBQUNZLElBQUwsQ0FBVSxLQUFLUSxXQUFMLENBQWlCTCxNQUFqQixFQUF5QkMsR0FBekIsRUFBOEJDLEtBQTlCLENBQVYsRUFBZ0QsS0FBaEQ7QUFDQTdCLGdCQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaLEVBQTBCLEtBQUsrQixXQUFMLENBQWlCTCxNQUFqQixFQUF5QkMsR0FBekIsRUFBOEJDLEtBQTlCLENBQTFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dEQUdhSSxRLEVBQWtCckIsSTs7Ozs7O0FBQy9CWixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFLENBQ0E7O0FBQ01pQyxnQkFBQUEsSSxHQUFPLEtBQUtBLElBQUwsQ0FBVXRCLElBQVYsRUFBZ0J1QixLQUFoQixDQUFzQm5DLE9BQU8sQ0FBQ0MsR0FBOUIsQzs7b0JBQ1JpQyxJOzs7Ozs7OztBQUNMbEMsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFVBQVosRUFBd0JnQyxRQUF4QjtBQUNBLHFCQUFLRyxLQUFMLENBQVc5QyxRQUFYLEdBQXNCMkMsUUFBdEI7QUFDTVgsZ0JBQUFBLFEsR0FBVztBQUFFZSxrQkFBQUEsU0FBUyxFQUFFSjtBQUFiLGlCLEVBQ2pCOztBQUNBckIsZ0JBQUFBLElBQUksQ0FBQ1ksSUFBTCxDQUFVLDJCQUFjLEtBQUtyQixNQUFuQixFQUEyQnNCLGdCQUFJYSxRQUEvQixFQUF5Q2hCLFFBQXpDLENBQVYsRUFBOEQsS0FBOUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBR1FNLEcsRUFBc0M7QUFBQSxVQUF6QlcsRUFBeUIsdUVBQXBCLFVBQUNWLEtBQUQsRUFBZ0IsQ0FBRSxDQUFFO0FBQzlDLFdBQUtULFFBQUwsQ0FBY3hCLFdBQWQsR0FBNEIyQyxFQUE1QixDQUQ4QyxDQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFVBQU0zQixJQUFJLEdBQUcsS0FBS0osQ0FBTCxDQUFPdUIsZUFBUCxDQUF1QkgsR0FBdkIsQ0FBYjtBQUNBLFVBQUksQ0FBQ2hCLElBQUwsRUFBVztBQUNYLFdBQUs0QixXQUFMLENBQWlCWixHQUFqQixFQUFzQmhCLElBQXRCO0FBQ0Q7Ozs7OztnREFFaUJnQixHLEVBQWFoQixJOzs7OztBQUM3QkEsZ0JBQUFBLElBQUksQ0FBQ1ksSUFBTCxDQUNFLDJCQUFjLEtBQUtyQixNQUFuQixFQUEyQnNCLGdCQUFJZ0IsU0FBL0IsRUFBMEM7QUFDeENKLGtCQUFBQSxTQUFTLEVBQUVUO0FBRDZCLGlCQUExQyxDQURGLEVBSUUsS0FKRjs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFRT2hCLEksRUFBYztBQUFBOztBQUNyQkEsTUFBQUEsSUFBSSxDQUFDOEIsSUFBTCxHQUFZLFVBQUFDLEdBQUcsRUFBSTtBQUNqQixRQUFBLE1BQUksQ0FBQ2hELFNBQUwsQ0FBZWdELEdBQWY7QUFDRCxPQUZEOztBQUlBL0IsTUFBQUEsSUFBSSxDQUFDZ0MsVUFBTCxHQUFrQixZQUFNO0FBQ3RCNUMsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksdUJBQVo7O0FBQ0EsUUFBQSxNQUFJLENBQUNPLENBQUwsQ0FBT1csV0FBUDtBQUNELE9BSEQ7O0FBS0EsVUFBSSxDQUFDLEtBQUtYLENBQUwsQ0FBT3FDLFdBQVAsQ0FBbUJqQyxJQUFJLENBQUNULE1BQXhCLENBQUwsRUFBc0M7QUFDcEM7QUFDQSxZQUFNMkMsR0FBRyxHQUFHLDJCQUFTLEtBQUszQyxNQUFkLEVBQXNCUyxJQUFJLENBQUNULE1BQTNCLENBQVosQ0FGb0MsQ0FHcEM7O0FBQ0EsWUFBTUksT0FBTyxHQUFHLEtBQUtILFFBQUwsQ0FBYzBDLEdBQWQsQ0FBaEIsQ0FKb0MsQ0FLcEM7O0FBQ0F2QyxRQUFBQSxPQUFPLENBQUN3QyxJQUFSLENBQWFuQyxJQUFiO0FBRUFaLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG1CQUFaLEVBQWlDLGNBQWpDLEVBQWlEVyxJQUFJLENBQUNULE1BQXREO0FBQ0FILFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLEtBQUtPLENBQUwsQ0FBT3dDLGFBQVAsRUFBWjtBQUVBL0IsUUFBQUEsVUFBVSxDQUFDLFlBQU07QUFDZixVQUFBLE1BQUksQ0FBQ2dDLFdBQUwsQ0FBaUJyQyxJQUFqQjtBQUNELFNBRlMsRUFFUCxJQUZPLENBQVY7QUFJQSxhQUFLUSxRQUFMLENBQWM1QixTQUFkLENBQXdCLEtBQUtnQixDQUFMLENBQU93QyxhQUFQLEVBQXhCO0FBQ0Q7QUFDRjs7O2dDQUVXcEMsSSxFQUFjO0FBQ3hCLFVBQUksS0FBS0osQ0FBTCxDQUFPMEMsYUFBUCxLQUF5QixLQUFLaEQsQ0FBbEMsRUFBcUM7QUFDbkM7QUFDQSxhQUFLWixRQUFMLENBQWMsS0FBS2EsTUFBbkIsRUFBMkJTLElBQTNCO0FBQ0QsT0FIRCxNQUdPO0FBQ0xaLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsS0FBS08sQ0FBTCxDQUFPMEMsYUFBUCxFQUE3QjtBQUNEO0FBQ0Y7Ozs4QkFFU0MsUSxFQUFrQjtBQUMxQixVQUFNQyxPQUFPLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXSCxRQUFYLENBQWhCO0FBQ0EsV0FBS3pDLFNBQUwsQ0FBZTZDLFFBQWYsQ0FBd0JILE9BQU8sQ0FBQ0ksSUFBaEMsRUFBc0NKLE9BQXRDO0FBQ0EsV0FBS0ssUUFBTCxDQUFjTCxPQUFkO0FBQ0Q7Ozs7OztnREFFY0EsTzs7Ozs7O0FBQ1BNLGdCQUFBQSxHLEdBQU0sMkJBQVMsS0FBS3ZELE1BQWQsRUFBc0JpRCxPQUFPLENBQUNqRCxNQUE5QixDO0FBQ05JLGdCQUFBQSxPLEdBQVUsS0FBS0gsUUFBTCxDQUFjc0QsR0FBZCxDLEVBRWhCO0FBQ0E7O0FBQ0FuRCxnQkFBQUEsT0FBTyxDQUFDb0QsT0FBUixDQUFnQixVQUFDL0MsSUFBRCxFQUFPTixDQUFQLEVBQWE7QUFDM0Isc0JBQUlNLElBQUksQ0FBQ1QsTUFBTCxLQUFnQmlELE9BQU8sQ0FBQ2pELE1BQTVCLEVBQW9DO0FBQ2xDSCxvQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixrQ0FBeEI7QUFDQU0sb0JBQUFBLE9BQU8sQ0FBQ3FELE1BQVIsQ0FBZXRELENBQWYsRUFBa0IsQ0FBbEI7QUFDQUMsb0JBQUFBLE9BQU8sQ0FBQ3dDLElBQVIsQ0FBYW5DLElBQWI7QUFDQSwyQkFBTyxDQUFQO0FBQ0Q7QUFDRixpQkFQRCxFLENBU0E7QUFDQTs7c0JBQ0lMLE9BQU8sQ0FBQ3NELE1BQVIsR0FBaUIsS0FBSzNELEM7Ozs7O0FBQ3hCRixnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixlQUF4QixFQUF5Q21ELE9BQU8sQ0FBQ2pELE1BQWpEOzt1QkFDcUIsS0FBSytCLElBQUwsQ0FBVTNCLE9BQU8sQ0FBQyxDQUFELENBQWpCLEVBQXNCNEIsS0FBdEIsQ0FBNEJuQyxPQUFPLENBQUNDLEdBQXBDLEM7OztBQUFmNkQsZ0JBQUFBLE07O0FBQ04sb0JBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1h2RCxrQkFBQUEsT0FBTyxDQUFDcUQsTUFBUixDQUFlLENBQWYsRUFBa0IsQ0FBbEI7QUFDRDs7Ozs7Ozs7Ozs7Ozs7OzswQkFJQ3JDLE0sRUFBOEI7QUFBQTs7QUFBQSxVQUFkd0MsS0FBYyx1RUFBTixJQUFNO0FBQ2xDLGFBQU8sSUFBSWxELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBTWlELENBQUMsR0FBRyxNQUFJLENBQUNDLEdBQWY7QUFDQSxZQUFNckQsSUFBSSxHQUFJb0QsQ0FBQyxDQUFDekMsTUFBRCxDQUFELEdBQVksSUFBSTJDLGdCQUFKLEVBQTFCO0FBQ0F0RCxRQUFBQSxJQUFJLENBQUN1RCxTQUFMO0FBQ0F2RCxRQUFBQSxJQUFJLENBQUN3RCxVQUFMLENBQWdCN0MsTUFBaEI7QUFFQSxZQUFNUCxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CRixVQUFBQSxNQUFNLENBQUMsbUJBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLEtBQUssSUFGa0IsQ0FBMUI7QUFJQUgsUUFBQUEsSUFBSSxDQUFDeUQsRUFBTCxDQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixVQUFDQyxHQUFELEVBQWlCO0FBQ3BDdkUsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0JzQixNQUEvQjs7QUFDQSxjQUFNaUQsQ0FBQyxHQUFHLE1BQUksQ0FBQ2hFLENBQUwsQ0FBT3VCLGVBQVAsQ0FBdUJSLE1BQXZCLENBQVY7O0FBQ0EsY0FBSSxDQUFDaUQsQ0FBTCxFQUFRO0FBQ1IsY0FBSUEsQ0FBQyxDQUFDckUsTUFBRixLQUFhb0IsTUFBakIsRUFDRSxNQUFJLENBQUNrRCxLQUFMLENBQVcsTUFBSSxDQUFDdEUsTUFBaEIsRUFBd0JvQixNQUF4QixFQUFnQztBQUFFZ0QsWUFBQUEsR0FBRyxFQUFIQSxHQUFGO0FBQU9SLFlBQUFBLEtBQUssRUFBTEE7QUFBUCxXQUFoQztBQUNILFNBTkQ7QUFRQW5ELFFBQUFBLElBQUksQ0FBQ3lELEVBQUwsQ0FBUUMsRUFBUixDQUFXLFNBQVgsRUFBc0IsWUFBTTtBQUMxQnRFLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBQW1Dc0IsTUFBbkM7O0FBQ0EsVUFBQSxNQUFJLENBQUNtRCxRQUFMLENBQWM5RCxJQUFkOztBQUNBUyxVQUFBQSxZQUFZLENBQUNMLE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FMRDtBQU1ELE9BeEJNLENBQVA7QUF5QkQ7OzsyQkFFTVMsTSxFQUFnQmdELEcsRUFBYVIsSyxFQUFlO0FBQUE7O0FBQ2pELGFBQU8sSUFBSWxELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBTWlELENBQUMsR0FBRyxNQUFJLENBQUNDLEdBQWY7QUFDQSxZQUFNckQsSUFBSSxHQUFJb0QsQ0FBQyxDQUFDekMsTUFBRCxDQUFELEdBQVksSUFBSTJDLGdCQUFKLEVBQTFCO0FBQ0F0RCxRQUFBQSxJQUFJLENBQUMrRCxVQUFMLENBQWdCSixHQUFoQjtBQUNBM0QsUUFBQUEsSUFBSSxDQUFDd0QsVUFBTCxDQUFnQjdDLE1BQWhCO0FBQ0F2QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaLEVBQTBCc0IsTUFBMUI7QUFFQSxZQUFNUCxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CRixVQUFBQSxNQUFNLENBQUMsb0JBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLEtBQUssSUFGa0IsQ0FBMUI7QUFJQUgsUUFBQUEsSUFBSSxDQUFDeUQsRUFBTCxDQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixVQUFDQyxHQUFELEVBQWlCO0FBQ3BDLGNBQU1DLENBQUMsR0FBRyxNQUFJLENBQUNoRSxDQUFMLENBQU9vRSxpQkFBUCxDQUF5QmIsS0FBekIsQ0FBVjs7QUFDQSxjQUFJUyxDQUFKLEVBQU9BLENBQUMsQ0FBQ2hELElBQUYsQ0FBTyxNQUFJLENBQUNRLFdBQUwsQ0FBaUIsTUFBSSxDQUFDN0IsTUFBdEIsRUFBOEJvQixNQUE5QixFQUFzQztBQUFFZ0QsWUFBQUEsR0FBRyxFQUFIQTtBQUFGLFdBQXRDLENBQVAsRUFBdUQsS0FBdkQ7QUFDUixTQUhEO0FBS0EzRCxRQUFBQSxJQUFJLENBQUN5RCxFQUFMLENBQVFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFlBQU07QUFDMUJ0RSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ3NCLE1BQXBDOztBQUNBLFVBQUEsTUFBSSxDQUFDbUQsUUFBTCxDQUFjOUQsSUFBZDs7QUFDQVMsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBTEQ7QUFNRCxPQXRCTSxDQUFQO0FBdUJEOzs7eUJBRUlTLE0sRUFBZ0JtQixJLEVBQVc7QUFDOUIsVUFBTThCLENBQUMsR0FBRyxLQUFLaEUsQ0FBTCxDQUFPb0UsaUJBQVAsQ0FBeUJyRCxNQUF6QixDQUFWOztBQUNBLFVBQUlpRCxDQUFKLEVBQU9BLENBQUMsQ0FBQ2hELElBQUYsQ0FBTywyQkFBYyxLQUFLckIsTUFBbkIsRUFBMkJzQixnQkFBSW9ELElBQS9CLEVBQXFDbkMsSUFBckMsQ0FBUCxFQUFtRCxLQUFuRDtBQUNSOzs7OEJBRVNvQyxXLEVBQWtCO0FBQzFCLFVBQU1DLFFBQVEsR0FBR0QsV0FBVyxDQUFDcEMsSUFBN0I7QUFDQSxVQUFNc0MsWUFBWSxHQUFHM0IsSUFBSSxDQUFDQyxLQUFMLENBQVd5QixRQUFYLENBQXJCOztBQUVBLFVBQUksQ0FBQzFCLElBQUksQ0FBQzRCLFNBQUwsQ0FBZSxLQUFLQyxRQUFwQixFQUE4QkMsUUFBOUIsQ0FBdUNILFlBQVksQ0FBQ3pGLElBQXBELENBQUwsRUFBZ0U7QUFDOUQsYUFBSzJGLFFBQUwsQ0FBY25DLElBQWQsQ0FBbUJpQyxZQUFZLENBQUN6RixJQUFoQztBQUNBLGFBQUtpQixDQUFMLENBQU9XLFdBQVA7QUFDQSxhQUFLaUUsU0FBTCxDQUFlTCxRQUFmO0FBQ0EsYUFBSzNELFFBQUwsQ0FBY3pCLFNBQWQsQ0FBd0JxRixZQUF4QjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJzaW1wbGUtZGF0YWNoYW5uZWwvbGliL05vZGVSVENcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25QaW5nOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkNvbW1hbmQ6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25QaW5nOiB0aGlzLm9uUGluZ1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQ6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIHRoaXMubm9kZUlkID0gX25vZGVJZDtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBwaW5nKHBlZXI6IFdlYlJUQykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcInBpbmdcIiwgcGVlci5ub2RlSWQpO1xuXG4gICAgICAvLzEw56eS5Lul5YaF44GrcGluZ+OBruODleODqeOCsOOBjOeri+OBpuOBsOaIkOWKn1xuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgZmFpbFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIHBlZXIuaXNEaXNjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vblBlZXJEaXNjb25uZWN0KHRoaXMua2J1Y2tldHMpO1xuICAgICAgICByZWplY3QoXCJwaW5nIHRpbWVvdXQgXCIgKyBwZWVyLm5vZGVJZCk7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuXG4gICAgICAvL3BpbmflrozkuobmmYLjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgIHRoaXMuY2FsbGJhY2suX29uUGluZ1twZWVyLm5vZGVJZF0gPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBzdWNjZXNzXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOCkuWQq+OCgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogcGVlci5ub2RlSWQgfTtcbiAgICAgIC8vcGluZ+OCkumAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5QSU5HLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcmVGb3JtYXQoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZVxuICAgIH07XG4gICAgcmV0dXJuIG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICB9XG5cbiAgYXN5bmMgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZCh0aGlzLnN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSksIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCB0aGlzLnN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSkpO1xuICB9XG5cbiAgYXN5bmMgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiKTtcbiAgICAvL+aOpee2mueiuuiqjVxuICAgIGNvbnN0IHBpbmcgPSB0aGlzLnBpbmcocGVlcikuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIGlmICghcGluZykgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgY2IgPSAodmFsdWU6IGFueSkgPT4ge30pIHtcbiAgICB0aGlzLmNhbGxiYWNrLm9uRmluZFZhbHVlID0gY2I7XG4gICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgLy8gcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAvLyAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAvLyB9KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLnNlbmQoXG4gICAgICBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCB7XG4gICAgICAgIHRhcmdldEtleToga2V5XG4gICAgICB9KSxcbiAgICAgIFwia2FkXCJcbiAgICApO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5kYXRhID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgb25SZXF1ZXN0KGRhdGFsaW5rOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhbGluayk7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICB0aGlzLm1haW50YWluKG5ldHdvcmspO1xuICB9XG5cbiAgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcImJ1Y2tldCBmdWxsZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5waW5nKGtidWNrZXRbMF0pLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKDAsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyh0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgcGVlci5ldi5vbihcInNpZ25hbFwiLCAoc2RwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyh0YXJnZXQpO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgcGVlci5ldi5vbihcInNpZ25hbFwiLCAoc2RwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGlmIChfKSBfLnNlbmQodGhpcy5zdG9yZUZvcm1hdCh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCB9KSwgXCJrYWRcIik7XG4gICAgICB9KTtcblxuICAgICAgcGVlci5ldi5vbihcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIG9uQ29tbWFuZChkYXRhY2hhbm5lbDogYW55KSB7XG4gICAgY29uc3QgZGF0YUxpbmsgPSBkYXRhY2hhbm5lbC5kYXRhO1xuICAgIGNvbnN0IG5ldHdvcmtMYXllciA9IEpTT04ucGFyc2UoZGF0YUxpbmspO1xuXG4gICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMub25SZXF1ZXN0KGRhdGFMaW5rKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25Db21tYW5kKG5ldHdvcmtMYXllcik7XG4gICAgfVxuICB9XG59XG4iXX0=